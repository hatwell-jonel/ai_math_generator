'use server';

import { GoogleGenAI } from "@google/genai";
import { supabase } from "../../lib/supabaseClient";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

export interface MathProblem {
    problem_text: string;
    final_answer: number;
    hint?: string;
    steps?: string[];
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

const GEN_AI_MODEL = 'gemini-2.0-flash-exp';

function mathProblemPrompt(difficulty: DifficultyLevel) {
    const uniqueSeed = Date.now(); 

    const difficultyGuidelines = {
        easy: `EASY - Simple calculations, 2-3 steps, numbers under 1000. Topics: basic operations, simple fractions, basic decimals, simple percentages (10%, 25%, 50%).`,
        medium: `MEDIUM - Standard Primary 5, 3-4 steps, moderate numbers. Topics: mixed operations, fractions, decimals, percentage, area, volume.`,
        hard: `HARD - Advanced Primary 5, 4-6 steps, large numbers. Topics: complex fractions, multi-step percentage, rate, composite figures, multi-angle problems.`
    };

    return `
        You are creating a math word problem for Primary 5 students in Singapore (10-11 years old) following the Singapore Mathematics Syllabus.

        DIFFICULTY: ${difficulty.toUpperCase()}
        ${difficultyGuidelines[difficulty]}

        Requirements:
        - Create a realistic, engaging word problem with a real-world context
        - The problem should be solvable and have ONE clear numerical answer
        - Use Singapore context when relevant (SGD for money, Singapore locations, etc.)

        CRITICAL: You must respond ONLY with valid JSON. No other text before or after.

        Return in this EXACT JSON format:
        {
            "problem_text": "Clear word problem statement here",
            "final_answer": numeric_answer_only,
            "hint": "A helpful hint that guides the student without revealing the full solution",
            "steps": [
                "Step 1 explanation",
                "Step 2 explanation",
                "Step 3 explanation"
            ]
        }
        Important:
        - final_answer must be ONLY a number (e.g., 45, 12.5, 250). Do NOT include units, words, or explanations.
        - hint should be encouraging and age-appropriate
        - steps should be clear, sequential instructions showing how to solve the problem

        **DIVERSITY CONSTRAINT:** The problem generated MUST be unique. Random seed: ${uniqueSeed}
    `;
}

export async function generateMathProblem(difficulty: DifficultyLevel = 'medium') {
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: mathProblemPrompt(difficulty),
            config: {
                temperature: 0.7, 
            },
        });

        const data = response?.text;
        const cleanText = data?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const problemData = JSON.parse(cleanText || '{}'); 

        // Save the problem to the database
        // const { data: savedProblem, error: dbError } = await supabase
        //     .from('math_problem_sessions')
        //     .insert({
        //         problem_text: problemData.problem_text,
        //         correct_answer: problemData.final_answer,
        //         difficulty_level: difficulty,
        //         hint: problemData.hint || null,
        //         solution_steps: problemData.steps || null
        //     })
        //     .select()
        //     .single();

        // if (dbError) {
        //     console.error('Error saving to database:', dbError);
        //     // Still return the problem even if DB save fails
        //     return {
        //         success: true,
        //         data: problemData,
        //         sessionId: null,
        //         warning: 'Problem generated but not saved to database'
        //     };
        // }

        return {
            success: true,
            data: problemData,
            difficulty: difficulty,
            // sessionId: savedProblem.id,
        };
    } catch (err) {
        console.error('Error generating math problem:', err);
        return {
            success: false,
            data: `'Error generating math problem:', ${err}`
        };
    }
}


function feedbackPrompt(problemText: string, correctAnswer: number, userAnswer: number) {
    return `
    A Primary 5 student in Singapore solved this math problem incorrectly:

    Problem: ${problemText}
    Correct Answer: ${correctAnswer}
    Student's Answer: ${userAnswer}

    Give brief (1 sentence), encouraging feedback with a gentle hint. Age-appropriate for 10-11 year olds.

    Return only the feedback text, no JSON or extra formatting.
    `;
}


export async function checkAnswer(userAnswer: number, correctAnswer: number, problemText: string, sessionId?: string | null) {
    try {
        // Check if answer is correct (with small tolerance for decimal answers)
        const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.01;
        let feedback = '';

        if (isCorrect) {
            feedback = 'Excellent work! Your answer is correct. You demonstrated strong problem-solving skills!';
        } else {
            const fbPrompt = feedbackPrompt(problemText, correctAnswer, userAnswer);

            const response = await genAI.models.generateContent({
                model: GEN_AI_MODEL,
                contents: fbPrompt,
                config: {
                    temperature: 0.8,
                    maxOutputTokens: 150,
                },
            });

            let generatedFeedback = response?.text;

            if (generatedFeedback) {
                generatedFeedback = generatedFeedback.replace(/```\n?/g, '').trim();
            }

            feedback = generatedFeedback || 'Good try! Check your calculations and try again.';
        }

        // if (sessionId) {
        //     supabase
        //         .from('math_problem_submissions')
        //         .insert({
        //             session_id: sessionId,
        //             user_answer: userAnswer,
        //             is_correct: isCorrect,
        //             feedback_text: feedback
        //         })
        //         .then(({ error: dbError }) => {
        //             if (dbError) {
        //                 console.error('Error saving submission:', dbError);
        //             }
        //         });
        // }

        return {
            success: true,
            isCorrect: isCorrect,
            feedback: feedback
        };
    } catch (err) {
        console.error('Error checking answer:', err);
        return {
            success: false,
            isCorrect: false,
            error: 'Failed to check answer. Please try again.',
            feedback: 'There was an error checking your answer. Please try submitting again.'
        };
    }
}