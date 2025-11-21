import { BlogPost } from '../types';

const STORAGE_KEY = 'captain_blog_posts';

const DEFAULT_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '为什么您的核心骨干总在流失？',
    summary: '了解最优秀坐席离职的三大原因，以及如何尽早发现离职征兆。',
    thumbnail: 'https://picsum.photos/600/400?random=1',
    readTime: '5 分钟阅读',
    date: '2024年05月20日',
    author: 'Captain AI',
    content: `
      <p>在呼叫中心行业，核心骨干（Top Performers）的流失往往比普通员工的流失带来更大的破坏力。他们不仅贡献了最高的KPI，往往还是团队的精神支柱。</p>
      
      <h2 class="text-xl font-bold mt-6 mb-4 text-slate-900">1. 职业发展天花板</h2>
      <p>这是最常见的原因。核心骨干往往学习能力强，当他们熟练掌握现有工作后，如果没有明确的晋升通道（如Team Leader、QA、培训师），他们会迅速感到厌倦。</p>
      <blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-slate-600 bg-slate-50 p-2">
        “我看不到未来，每天只是在重复接电话。” —— 某离职Top Sales访谈
      </blockquote>

      <h2 class="text-xl font-bold mt-6 mb-4 text-slate-900">2. 薪资与贡献不匹配</h2>
      <p>虽然钱不是万能的，但对于高绩效员工，如果他们的收入与普通员工拉不开差距，这就成了“大锅饭”。必须建立基于绩效的激进奖金制度。</p>

      <h2 class="text-xl font-bold mt-6 mb-4 text-slate-900">3. 缺乏认可</h2>
      <p>很多管理者认为核心骨干“不用操心”，从而忽略了对他们的关注。实际上，高绩效员工更需要定期的反馈和认可。</p>

      <div class="mt-8 p-4 bg-blue-50 rounded-lg text-center">
        <p class="font-bold text-blue-800">如何解决？</p>
        <p class="text-sm text-blue-600 mt-1">请使用我们的“诊断罗盘”工具，定制您的留存方案。</p>
      </div>
    `
  },
  {
    id: '2',
    title: '1对1辅导的艺术',
    summary: '将每周的例行检查转化为强有力的辅导课程，而非简单的状态更新。',
    thumbnail: 'https://picsum.photos/600/400?random=2',
    readTime: '8 分钟阅读',
    date: '2024年05月18日',
    author: 'Captain AI',
    content: `
      <p>大多数经理的1对1（One-on-One）都变成了“工作汇报流水账”。这不仅浪费时间，还错失了建立信任的良机。</p>
      <h2 class="text-xl font-bold mt-6 mb-4 text-slate-900">辅导模型：GROW</h2>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>G (Goal)</strong>: 目标是什么？</li>
        <li><strong>R (Reality)</strong>: 现状如何？</li>
        <li><strong>O (Options)</strong>: 有哪些选择？</li>
        <li><strong>W (Will)</strong>: 下一步做什么？</li>
      </ul>
      <p class="mt-4">在下一次面谈中，尝试少问“这周做了什么”，多问“你这周遇到的最大挑战是什么”。</p>
    `
  },
  {
    id: '3',
    title: '优化排班遵从度',
    summary: '数据驱动策略：在不伤害团队士气的前提下提高排班遵从度。',
    thumbnail: 'https://picsum.photos/600/400?random=3',
    readTime: '6 分钟阅读',
    date: '2024年05月15日',
    author: '数据中心',
    content: `
      <p>排班遵从度（Adherence）直接影响接通率和服务水平（SLA）。但强硬的手段往往导致员工不满。</p>
      <p>更有效的策略是引入<strong>“自主排班”</strong>和<strong>“班次置换”</strong>机制，让员工在一定规则下拥有掌控感。</p>
    `
  }
];

// Helper to get posts from storage or default
const loadPosts = (): BlogPost[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load blog posts", e);
  }
  // Initialize storage with defaults if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
  return DEFAULT_POSTS;
};

export const getBlogPosts = (): BlogPost[] => {
  return loadPosts();
};

export const getPostById = (id: string): BlogPost | undefined => {
  const posts = loadPosts();
  return posts.find(p => p.id === id);
};

export const saveBlogPost = (post: BlogPost): void => {
  const posts = loadPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.unshift(post);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const deleteBlogPost = (id: string): void => {
  const posts = loadPosts();
  const newPosts = posts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
};