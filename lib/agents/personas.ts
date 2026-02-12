/**
 * Persona Agents
 * @ai-context Simulated client accounts for anti-cold start
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { logAgentAction } from './logger';
import type { AgentPersona, PersonaCommentPayload } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI client for generating natural comments
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Comment templates by sentiment (fallback if OpenAI fails)
const COMMENT_TEMPLATES = {
    positive: [
        'Magnifique ! 😍',
        'J\'adore cette création 🔥',
        'Superbe travail !',
        'Élégance pure ✨',
        'Vraiment sublime 👏',
    ],
    compliment: [
        'Les finitions sont impeccables !',
        'Le choix du tissu est parfait',
        'On sent le savoir-faire',
        'Quelle maîtrise ! Bravo',
    ],
    question: [
        'C\'est disponible en d\'autres couleurs ?',
        'Vous livrez à l\'international ?',
        'Quel est le délai de confection ?',
        'Peut-on personnaliser le modèle ?',
    ],
};

/**
 * Execute a persona action
 */
export async function executePersonaAction(
    persona: AgentPersona,
    actionType: 'like' | 'comment' | 'save' | 'follow',
    targetId?: string
): Promise<boolean> {
    const agentId = `persona:${persona.name.toLowerCase().split(' ')[0]}`;

    try {
        // Get a random post/tailor to interact with if not specified
        const target = targetId || await getRandomTarget(actionType);

        if (!target) {
            console.log(`[Persona:${persona.name}] No target found for ${actionType}`);
            return false;
        }

        switch (actionType) {
            case 'like':
                await executeLike(persona, target);
                break;
            case 'comment':
                await executeComment(persona, target);
                break;
            case 'save':
                await executeSave(persona, target);
                break;
            case 'follow':
                await executeFollow(persona, target);
                break;
        }

        // Update persona stats
        await supabase
            .from('agent_personas')
            .update({
                total_actions: persona.total_actions + 1,
                last_action_at: new Date().toISOString(),
            })
            .eq('id', persona.id);

        await logAgentAction({
            agentId,
            agentType: 'persona',
            actionType,
            payload: { target_id: target, persona_name: persona.name },
            isSynthetic: true,
            success: true,
        });

        return true;
    } catch (error) {
        console.error(`[Persona:${persona.name}] Action failed:`, error);

        await logAgentAction({
            agentId,
            agentType: 'persona',
            actionType,
            payload: { persona_name: persona.name },
            isSynthetic: true,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });

        return false;
    }
}

/**
 * Get a random target for the action
 */
async function getRandomTarget(actionType: string): Promise<string | null> {
    if (actionType === 'follow') {
        // Get a random tailor
        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('user_type', 'tailor')
            .limit(10);

        if (!data || data.length === 0) return null;
        return data[Math.floor(Math.random() * data.length)].id;
    }

    // Get a random post
    const { data } = await supabase
        .from('posts')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(20);

    if (!data || data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)].id;
}

/**
 * Execute a like action
 */
async function executeLike(persona: AgentPersona, postId: string): Promise<void> {
    // Check if already liked
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', persona.id)
        .eq('post_id', postId)
        .single();

    if (existingLike) {
        console.log(`[Persona:${persona.name}] Already liked post ${postId}`);
        return;
    }

    await supabase
        .from('likes')
        .insert({
            user_id: persona.id,
            post_id: postId,
            is_synthetic: true,
        });

    console.log(`[Persona:${persona.name}] Liked post ${postId}`);
}

/**
 * Execute a comment action with AI-generated text
 */
async function executeComment(persona: AgentPersona, postId: string): Promise<void> {
    let commentText: string;
    let tokensUsed = 0;

    try {
        // Try to generate a natural comment with GPT
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es ${persona.name}, une ${persona.persona_type === 'elegant' ? 'élégante sénégalaise' : persona.persona_type === 'trendy' ? 'jeune fashionista' : 'amateur de mode classique'}. Tu commentes des publications de mode africaine sur Instagram. Tes commentaires sont courts (max 15 mots), authentiques et enthousiastes. Tu utilises parfois des emojis. Tu parles français.`,
                },
                {
                    role: 'user',
                    content: `Génère un commentaire pour une belle création de mode africaine (boubou, kaftan ou tenue traditionnelle). Sois ${['admiratif', 'curieux', 'enthousiaste'][Math.floor(Math.random() * 3)]}.`,
                },
            ],
            max_tokens: 50,
            temperature: 0.9,
        });

        commentText = completion.choices[0]?.message?.content || getRandomTemplate();
        tokensUsed = completion.usage?.total_tokens || 0;
    } catch (error) {
        console.log(`[Persona:${persona.name}] OpenAI failed, using template`);
        commentText = getRandomTemplate();
    }

    await supabase
        .from('comments')
        .insert({
            user_id: persona.id,
            post_id: postId,
            content: commentText,
            is_synthetic: true,
        });

    // Log with token usage
    await logAgentAction({
        agentId: `persona:${persona.name.toLowerCase().split(' ')[0]}`,
        agentType: 'persona',
        actionType: 'comment',
        payload: { post_id: postId, comment: commentText },
        isSynthetic: true,
        tokensUsed,
    });

    console.log(`[Persona:${persona.name}] Commented on ${postId}: "${commentText}"`);
}

/**
 * Get a random comment template
 */
function getRandomTemplate(): string {
    const categories = Object.values(COMMENT_TEMPLATES);
    const allTemplates = categories.flat();
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
}

/**
 * Execute a save/bookmark action
 */
async function executeSave(persona: AgentPersona, postId: string): Promise<void> {
    const { data: existingSave } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', persona.id)
        .eq('post_id', postId)
        .single();

    if (existingSave) {
        console.log(`[Persona:${persona.name}] Already saved post ${postId}`);
        return;
    }

    await supabase
        .from('bookmarks')
        .insert({
            user_id: persona.id,
            post_id: postId,
            is_synthetic: true,
        });

    console.log(`[Persona:${persona.name}] Saved post ${postId}`);
}

/**
 * Execute a follow action
 */
async function executeFollow(persona: AgentPersona, tailorId: string): Promise<void> {
    const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', persona.id)
        .eq('following_id', tailorId)
        .single();

    if (existingFollow) {
        console.log(`[Persona:${persona.name}] Already following ${tailorId}`);
        return;
    }

    await supabase
        .from('follows')
        .insert({
            follower_id: persona.id,
            following_id: tailorId,
            is_synthetic: true,
        });

    console.log(`[Persona:${persona.name}] Now following ${tailorId}`);
}

/**
 * Get persona by name
 */
export async function getPersonaByName(name: string): Promise<AgentPersona | null> {
    const { data, error } = await supabase
        .from('agent_personas')
        .select('*')
        .ilike('name', `%${name}%`)
        .single();

    if (error || !data) return null;
    return data;
}
