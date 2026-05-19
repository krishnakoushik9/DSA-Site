import {
    Calculator,
    Code2,
    Cpu,
    Boxes,
    Layers,
    Wand2,
    Brain,
    Plug,
    Wrench,
    Bot,
    Lightbulb,
    Search,
    Rocket,
    BookMarked,
    Youtube,
    Globe,
    FileText,
    LucideIcon,
} from 'lucide-react';

export interface LearnLink {
    label: string;
    href: string;
}

export interface LearnSubsection {
    title: string;
    links: LearnLink[];
}

export interface LearnSection {
    id: string;
    title: string;
    icon: LucideIcon;
    accent: string; // CSS color variable token, e.g. 'var(--th-nord8)'
    links?: LearnLink[];
    subsections?: LearnSubsection[];
}

export const LEARN_AI_INTRO = {
    heading: 'Learn AI Engineering',
    body: 'A comprehensive collection of free resources to learn everything about AI/ML, LLMs and Agents.',
};

export const LEARN_AI_SECTIONS: LearnSection[] = [
    {
        id: 'math',
        title: 'Mathematical Foundations',
        icon: Calculator,
        accent: 'var(--th-nord8)',
        links: [
            { label: 'Mathematics Roadmap for Machine Learning', href: 'https://thepalindrome.org/p/the-roadmap-of-mathematics-for-machine-learning' },
            { label: 'Essence of Linear Algebra — 3Blue1Brown', href: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
            { label: 'Probability & Statistics — Khan Academy', href: 'https://www.khanacademy.org/math/statistics-probability' },
            { label: 'Statistics Fundamentals — Josh Starmer', href: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9' },
            { label: 'Mathematics for Machine Learning Specialization — Coursera', href: 'https://www.coursera.org/specializations/mathematics-machine-learning' },
        ],
    },
    {
        id: 'python',
        title: 'Python',
        icon: Code2,
        accent: 'var(--th-nord14)',
        links: [
            { label: 'AI Python for Beginners — Deeplearning.ai', href: 'https://www.deeplearning.ai/short-courses/ai-python-for-beginners/' },
        ],
    },
    {
        id: 'ml-fundamentals',
        title: 'AI & ML Fundamentals',
        icon: Cpu,
        accent: 'var(--th-nord9)',
        links: [
            { label: 'Machine Learning Crash Course — Google', href: 'https://developers.google.com/machine-learning/crash-course' },
            { label: 'AI for Beginners — Microsoft', href: 'https://microsoft.github.io/AI-For-Beginners/' },
            { label: 'Elements of AI — University of Helsinki', href: 'https://course.elementsofai.com/' },
            { label: 'Machine Learning Playlist — Josh Starmer', href: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF' },
            { label: 'Machine Learning Specialization — Coursera', href: 'https://www.coursera.org/specializations/machine-learning-introduction' },
        ],
        subsections: [
            {
                title: 'Machine Learning Frameworks',
                links: [
                    { label: 'Scikit-learn', href: 'https://scikit-learn.org/stable/' },
                    { label: 'XGBoost', href: 'https://xgboost.ai/' },
                    { label: 'LightGBM', href: 'https://lightgbm.readthedocs.io/en/stable/' },
                    { label: 'CatBoost', href: 'https://catboost.ai/' },
                ],
            },
        ],
    },
    {
        id: 'deep-learning',
        title: 'Deep Learning',
        icon: Boxes,
        accent: 'var(--th-nord10)',
        links: [
            { label: 'Deep Learning Specialization — Coursera (Andrew Ng)', href: 'https://www.coursera.org/specializations/deep-learning' },
            { label: 'Practical Deep Learning for Coders — Fast.ai', href: 'https://course.fast.ai/' },
            { label: 'Mathematics for Deep Learning', href: 'https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/' },
            { label: 'Deep Learning Playlist — Josh Starmer', href: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUIxGDQs4LFFD--41Vzf-ME1' },
        ],
        subsections: [
            {
                title: 'Deep Learning Frameworks',
                links: [
                    { label: 'TensorFlow', href: 'https://www.tensorflow.org/' },
                    { label: 'PyTorch', href: 'https://pytorch.org/' },
                    { label: 'Keras', href: 'https://keras.io/' },
                ],
            },
        ],
    },
    {
        id: 'dl-specializations',
        title: 'Deep Learning Specializations',
        icon: Layers,
        accent: 'var(--th-nord11)',
        subsections: [
            {
                title: 'Computer Vision',
                links: [
                    { label: 'Deep Learning for Computer Vision — Stanford', href: 'https://cs231n.stanford.edu/' },
                ],
            },
            {
                title: 'Natural Language Processing (NLP)',
                links: [
                    { label: 'NLP Specialization — Coursera', href: 'https://www.coursera.org/specializations/natural-language-processing' },
                ],
            },
            {
                title: 'Reinforcement Learning',
                links: [
                    { label: 'Deep RL Course — Hugging Face', href: 'https://huggingface.co/learn/deep-rl-course/unit0/introduction' },
                    { label: 'Deep RL Bootcamp — UC Berkeley', href: 'https://sites.google.com/view/deep-rl-bootcamp/lectures' },
                ],
            },
        ],
    },
    {
        id: 'genai',
        title: 'Generative AI',
        icon: Wand2,
        accent: 'var(--th-nord15)',
        links: [
            { label: 'The Building Blocks of Generative AI', href: 'https://shriftman.substack.com/p/the-building-blocks-of-generative' },
            { label: 'Generative AI for Beginners — Microsoft', href: 'https://github.com/microsoft/generative-ai-for-beginners' },
            { label: 'Generative AI for Everyone — Coursera', href: 'https://www.coursera.org/learn/generative-ai-for-everyone' },
        ],
    },
    {
        id: 'llms',
        title: 'Large Language Models (LLMs)',
        icon: Brain,
        accent: 'var(--th-nord8)',
        links: [
            { label: 'The Illustrated Transformer', href: 'https://jalammar.github.io/illustrated-transformer/' },
            { label: 'Large Language Models explained briefly', href: 'https://www.youtube.com/watch?v=LPZh9BOjkQs' },
            { label: 'Intro to LLMs', href: 'https://www.youtube.com/watch?v=zjkBMFhNj_g' },
            { label: 'Understanding Large Language Models', href: 'https://magazine.sebastianraschka.com/p/understanding-large-language-models' },
            { label: 'A Visual Guide to Reasoning LLMs', href: 'https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-reasoning-llms' },
            { label: 'Understanding Reasoning LLMs', href: 'https://magazine.sebastianraschka.com/p/understanding-reasoning-llms' },
            { label: 'Understanding Multimodal LLMs', href: 'https://magazine.sebastianraschka.com/p/understanding-multimodal-llms' },
            { label: 'A Visual Guide to Mixture of Experts (MoE)', href: 'https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mixture-of-experts' },
            { label: 'Finetuning Large Language Models', href: 'https://magazine.sebastianraschka.com/p/finetuning-large-language-models' },
            { label: 'How Transformer LLMs Work', href: 'https://www.deeplearning.ai/short-courses/how-transformer-llms-work/' },
            { label: 'Building GPT from scratch — Andrej Karpathy', href: 'https://www.youtube.com/watch?v=kCc8FmEb1nY' },
            { label: 'LLM Course — GitHub', href: 'https://github.com/mlabonne/llm-course' },
            { label: 'LLM Course — Hugging Face', href: 'https://huggingface.co/learn/llm-course/chapter1/1' },
            { label: 'Awesome LLM Apps — GitHub', href: 'https://github.com/Shubhamsaboo/awesome-llm-apps' },
        ],
        subsections: [
            {
                title: 'LLM Chatbots',
                links: [
                    { label: 'ChatGPT', href: 'https://chatgpt.com/' },
                    { label: 'Gemini', href: 'https://gemini.google.com/app' },
                    { label: 'Claude', href: 'https://claude.ai/new' },
                    { label: 'Perplexity', href: 'https://www.perplexity.ai/' },
                ],
            },
            {
                title: 'Open Source LLMs',
                links: [
                    { label: 'Llama', href: 'https://www.llama.com/' },
                    { label: 'Deepseek', href: 'https://chat.deepseek.com/' },
                ],
            },
            {
                title: 'LLM APIs',
                links: [
                    { label: 'OpenAI', href: 'https://platform.openai.com/docs/overview' },
                    { label: 'Anthropic', href: 'https://docs.anthropic.com/en/docs/overview' },
                    { label: 'Gemini — Google', href: 'https://ai.google.dev/gemini-api/docs' },
                    { label: 'Groq — Inference', href: 'https://groq.com/' },
                ],
            },
            {
                title: 'LLM Tools & Frameworks',
                links: [
                    { label: 'LangChain', href: 'https://www.langchain.com/' },
                    { label: 'LlamaIndex', href: 'https://www.llamaindex.ai/' },
                    { label: 'Ollama', href: 'https://ollama.com/' },
                    { label: 'Instructor', href: 'https://python.useinstructor.com/' },
                    { label: 'Outlines', href: 'https://github.com/dottxt-ai/outlines' },
                ],
            },
            {
                title: 'LLM Based IDEs',
                links: [
                    { label: 'Cursor', href: 'https://www.cursor.com/' },
                    { label: 'Windsurf', href: 'https://windsurf.com/editor' },
                    { label: 'GitHub Copilot', href: 'https://github.com/features/copilot' },
                ],
            },
            {
                title: 'Agentic Coding Tools',
                links: [
                    { label: 'Claude Code', href: 'https://code.claude.com/docs/en/overview' },
                    { label: 'Codex', href: 'https://openai.com/codex/' },
                ],
            },
        ],
    },
    {
        id: 'prompt-engineering',
        title: 'Prompt Engineering',
        icon: Lightbulb,
        accent: 'var(--th-nord13)',
        links: [
            { label: 'Google Prompting Essentials', href: 'https://www.coursera.org/google-learn/prompting-essentials' },
            { label: 'ChatGPT Prompt Engineering for Developers — Deeplearning.ai', href: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/' },
            { label: 'Advanced Prompting Techniques — Instructor', href: 'https://python.useinstructor.com/prompting/' },
            { label: 'Prompt Engineering Techniques — GitHub', href: 'https://github.com/NirDiamant/Prompt_Engineering' },
            { label: 'Getting Structured LLM Output — Deeplearning.ai', href: 'https://www.deeplearning.ai/short-courses/getting-structured-llm-output/' },
            { label: 'God Tier Prompts', href: 'https://www.godtierprompts.com/' },
        ],
    },
    {
        id: 'rag',
        title: 'Retrieval-Augmented Generation (RAG)',
        icon: Search,
        accent: 'var(--th-nord14)',
        links: [
            { label: 'Introduction to RAG — Coursera', href: 'https://www.coursera.org/projects/introduction-to-rag' },
            { label: 'RAG Techniques — GitHub', href: 'https://github.com/NirDiamant/RAG_Techniques' },
        ],
    },
    {
        id: 'ai-agents',
        title: 'AI Agents',
        icon: Bot,
        accent: 'var(--th-nord9)',
        links: [
            { label: 'A Visual Guide to LLM Agents', href: 'https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-llm-agents' },
            { label: 'Agents — Chip Huyen', href: 'https://huyenchip.com/2025/01/07/agents.html' },
            { label: 'AI Agents Course — Hugging Face', href: 'https://huggingface.co/learn/agents-course/' },
            { label: 'Building AI Browser Agents — Deeplearning.ai', href: 'https://www.deeplearning.ai/short-courses/building-ai-browser-agents/' },
            { label: 'GenAI Agents — GitHub', href: 'https://github.com/NirDiamant/GenAI_Agents' },
            { label: 'AI Agents in Action, Second Edition — Book', href: 'https://www.manning.com/books/ai-agents-in-action-second-edition' },
        ],
    },
    {
        id: 'mcp',
        title: 'Model Context Protocol (MCP)',
        icon: Plug,
        accent: 'var(--th-nord10)',
        links: [
            { label: 'MCP — Anthropic Guide', href: 'https://modelcontextprotocol.io/introduction' },
            { label: 'Building AI Apps using MCP', href: 'https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/' },
            { label: 'MCP Course — Hugging Face', href: 'https://huggingface.co/learn/mcp-course/unit0/introduction' },
            { label: 'Awesome MCP Servers — GitHub', href: 'https://github.com/punkpeye/awesome-mcp-servers' },
        ],
    },
    {
        id: 'mlops',
        title: 'MLOps & Deployment',
        icon: Rocket,
        accent: 'var(--th-nord11)',
        links: [
            { label: 'ML in Production — Coursera', href: 'https://www.coursera.org/learn/introduction-to-machine-learning-in-production' },
            { label: 'Full Stack Deep Learning', href: 'https://fullstackdeeplearning.com/course/2022/' },
            { label: 'ML System Design — Stanford', href: 'https://stanford-cs329s.github.io/syllabus.html' },
        ],
        subsections: [
            {
                title: 'Tools',
                links: [
                    { label: 'Streamlit', href: 'https://streamlit.io/' },
                    { label: 'MLflow', href: 'https://mlflow.org/docs/latest/index.html' },
                ],
            },
        ],
    },
    {
        id: 'guides',
        title: 'Guides',
        icon: Wrench,
        accent: 'var(--th-nord12)',
        links: [
            { label: 'OpenAI Cookbook', href: 'https://cookbook.openai.com/' },
            { label: 'Anthropic Courses', href: 'https://github.com/anthropics/courses/tree/master' },
        ],
    },
    {
        id: 'books',
        title: 'Books',
        icon: BookMarked,
        accent: 'var(--th-nord15)',
        links: [
            { label: 'Hands-On Machine Learning', href: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/' },
            { label: 'Deep Learning — Ian Goodfellow', href: 'https://www.deeplearningbook.org/' },
            { label: 'Deep Learning with Python', href: 'https://www.amazon.in/Deep-Learning-Python-Francois-Chollet/dp/1617294438/' },
            { label: 'Why Machines Learn', href: 'https://www.amazon.com/Why-Machines-Learn-Elegant-Behind/dp/0593185749' },
            { label: 'Designing Machine Learning Systems', href: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/' },
            { label: 'AI Engineering', href: 'https://www.oreilly.com/library/view/ai-engineering/9781098166298/' },
            { label: 'Build a LLM from Scratch', href: 'https://www.manning.com/books/build-a-large-language-model-from-scratch' },
            { label: 'Prompt Engineering for LLMs', href: 'https://www.oreilly.com/library/view/prompt-engineering-for/9781098156145/' },
            { label: 'Natural Language Processing with Transformers', href: 'https://www.oreilly.com/library/view/natural-language-processing/9781098136789/' },
            { label: 'Build a Multi-Agent System (from Scratch)', href: 'https://www.manning.com/books/build-a-multi-agent-system-from-scratch' },
            { label: 'Build a Reasoning Model (From Scratch)', href: 'https://www.manning.com/books/build-a-reasoning-model-from-scratch' },
            { label: 'Build an AI Agent (From Scratch)', href: 'https://www.manning.com/books/build-an-ai-agent-from-scratch' },
            { label: 'Build an LLM Application (from Scratch)', href: 'https://www.manning.com/books/build-llm-applications-from-scratch' },
            { label: 'AI Agents in Action', href: 'https://www.manning.com/books/gpt-agents-in-action' },
            { label: 'AI Agents in Action, Second Edition', href: 'https://www.manning.com/books/ai-agents-in-action-second-edition' },
            { label: 'LLMs in Production', href: 'https://www.manning.com/books/llms-in-production' },
        ],
    },
    {
        id: 'youtube',
        title: 'YouTube Channels',
        icon: Youtube,
        accent: 'var(--th-nord11)',
        links: [
            { label: 'Andrej Karpathy', href: 'https://www.youtube.com/@AndrejKarpathy' },
            { label: '3Blue1Brown', href: 'https://www.youtube.com/@3blue1brown' },
        ],
    },
    {
        id: 'other',
        title: 'Other Resources',
        icon: Globe,
        accent: 'var(--th-nord7)',
        links: [
            { label: 'Papers with Code', href: 'https://paperswithcode.com/' },
            { label: 'Kaggle Competitions', href: 'https://www.kaggle.com/competitions' },
        ],
    },
    {
        id: 'papers',
        title: 'Must-Read AI Papers',
        icon: FileText,
        accent: 'var(--th-nord8)',
        links: [
            { label: 'Attention Is All You Need', href: 'https://arxiv.org/pdf/1706.03762' },
            { label: 'Generative Adversarial Networks (GANs)', href: 'https://arxiv.org/abs/1406.2661' },
            { label: 'GPT: Improving Language Understanding by Generative Pre-Training', href: 'https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf' },
            { label: 'GPT-3: Language Models are Few-Shot Learners', href: 'https://arxiv.org/abs/2005.14165' },
            { label: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', href: 'https://arxiv.org/abs/1810.04805' },
            { label: 'Chain-of-Thought Prompting Elicits Reasoning in LLMs', href: 'https://arxiv.org/abs/2201.11903' },
        ],
    },
];

