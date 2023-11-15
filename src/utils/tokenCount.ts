import cl100k_base from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken } from '@dqbd/tiktoken/lite';
import OpenAI from 'openai';
import ChatCompletionContentPart = OpenAI.ChatCompletionContentPart;

export function tokenCount(content: string | null | Array<ChatCompletionContentPart>): number {
    const encoding = new Tiktoken(cl100k_base.bpe_ranks, cl100k_base.special_tokens, cl100k_base.pat_str);
    const tokens = encoding.encode(<string>content);
    encoding.free();
    return tokens.length;
}
