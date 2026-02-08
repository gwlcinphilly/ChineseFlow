import { useState, useEffect } from 'react';
import { api } from '../api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface AISettings {
  provider: 'kimi' | 'openrouter' | 'openai' | 'siliconflow';
  apiKey: string;
  model: string;
  database?: {
    type: 'sqlite' | 'postgresql';
    postgresql_url?: string;
  };
}

interface User {
  id: number;
  username: string;
  display_name?: string;
  avatar?: string;
  created_at: string;
}

const DEFAULT_SETTINGS: AISettings = {
  provider: 'kimi',
  apiKey: '',
  model: 'kimi-latest',
};

const KIMI_MODELS = [
  { value: 'kimi-latest', label: 'Kimi Latest (推荐)' },
  { value: 'kimi-k2-0711-preview', label: 'Kimi K2 (0711 Preview)' },
  { value: 'kimi-k2.5', label: 'Kimi K2.5' },
];

const OPENROUTER_MODELS = [
  { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'openai/gpt-4o', label: 'GPT-4o' },
];

const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (图片生成支持 DALL-E 3)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
];

const SILICONFLOW_MODELS = [
  { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen2.5-7B (免费额度)' },
  { value: 'deepseek-ai/DeepSeek-V2.5', label: 'DeepSeek-V2.5' },
  { value: 'THUDM/glm-4-9b-chat', label: 'GLM-4-9B' },
];

// AI Prompts for reference
const AI_PROMPTS = [
  {
    title: '汉字内容生成',
    description: '为汉字生成拼音、部首、笔画、笔顺、释义、儿歌、字源等完整学习内容',
    prompt: `你是一个专业的中文汉字教育专家。请为给定的汉字生成详细的学习内容。

请按照以下JSON格式返回：
{
  "pinyin": "拼音（带声调）",
  "alt_pinyin": "备选读音（如有）",
  "radical": "部首",
  "stroke_count": 数字,
  "stroke_order": "笔顺描述，使用标准笔画Unicode符号",
  "illustration_desc": "插图描述（20字以内）",
  "rhyme_text": "四句儿歌",
  "ancient_forms": {
    "bronze": "金文形式",
    "seal": "小篆形式",
    "clerical": "隶书形式"
  },
  "etymology": "字源解释（50-100字）",
  "word_groups": {
    "tone1": ["词语1", "词语2"],
    "tone2": []
  },
  "famous_quotes": [
    {"quote": "名句", "author": "作者", "source": "出处"}
  ],
  "character_structure": {
    "base_char": "基本字",
    "related": [{"char": "相关字", "pinyin": "拼音", "meaning": "释义"}]
  },
  "meaning": "基本释义"
}`,
  },
  {
    title: '词语内容生成',
    description: '为词语生成拼音、英文翻译和例句',
    prompt: `你是一个专业的中文词汇教育专家。请为给定的中文词语生成详细的学习内容。

请按照以下JSON格式返回：
{
  "pinyin": "词语的拼音（带声调）",
  "english_translation": "英文翻译",
  "example_sentence": "造句（包含该词语的中文句子）",
  "example_pinyin": "造句的拼音（带声调）",
  "example_translation": "造句的英文翻译"
}

注意：
1. 拼音使用标准拼音格式，带声调符号（如：bái sè）
2. 造句要简单易懂，适合初学者
3. 英文翻译要准确自然`,
  },
  {
    title: '图片生成描述',
    description: '为汉字生成适合AI绘画的插图描述',
    prompt: `你是一个专业的中文教育插图设计师。请为给定的汉字生成适合儿童学习的插图描述。

要求：
1. 描述应该生动形象，帮助理解汉字含义
2. 风格应该简洁明快，适合儿童
3. 包含汉字本身的视觉呈现
4. 20字以内，简洁明了`,
  },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<'ai' | 'users' | 'prompts'>('ai');
  
  // AI Settings
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{valid: boolean; message: string} | null>(null);
  const [testing, setTesting] = useState(false);

  // User Management
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      const response = await fetch(`${API_BASE_URL}/users`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Users data:', data);
      // Ensure data is an array
      const usersArray = Array.isArray(data) ? data : [];
      setUsers(usersArray);
      // Set first user as current if none selected
      if (usersArray.length > 0 && !currentUser) {
        setCurrentUser(usersArray[0]);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('保存失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setSettings(DEFAULT_SETTINGS);
    setTestResult(null);
    await api.saveSettings(DEFAULT_SETTINGS);
  };

  const handleTest = async () => {
    try {
      await api.saveSettings(settings);
      setTesting(true);
      setTestResult(null);
      const result = await api.testSettings();
      setTestResult(result);
    } catch (err) {
      setError('测试失败: ' + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  // User management handlers
  const handleCreateUser = async () => {
    if (!newUsername.trim()) return;
    
    try {
      setUserLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          display_name: newDisplayName.trim() || newUsername.trim()
        })
      });
      
      if (response.ok) {
        setNewUsername('');
        setNewDisplayName('');
        setShowAddUser(false);
        await loadUsers();
      } else {
        const err = await response.json();
        alert(err.detail || '创建用户失败');
      }
    } catch (err) {
      alert('创建用户失败');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('确定要删除这个用户吗？所有学习进度也将被删除。')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadUsers();
        if (currentUser?.id === userId) {
          setCurrentUser(null);
        }
      } else {
        const err = await response.json();
        alert(err.detail || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    // TODO: Save current user to localStorage or context
    localStorage.setItem('currentUserId', user.id.toString());
    alert(`已切换到用户: ${user.display_name || user.username}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'ai'
              ? 'bg-amber-500 text-white'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
          }`}
        >
          🤖 AI 设置
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-amber-500 text-white'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
          }`}
        >
          👤 用户管理
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'prompts'
              ? 'bg-amber-500 text-white'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
          }`}
        >
          📝 AI 提示词
        </button>
      </div>

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI 设置</h2>
                <p className="text-sm text-stone-500">配置 AI API 以自动生成汉字学习内容</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            {/* Provider */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">AI 提供商</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSettings({ ...settings, provider: 'kimi' })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    settings.provider === 'kimi'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div className="font-medium">Kimi</div>
                  <div className="text-xs text-stone-500">月之暗面 Moonshot</div>
                </button>
                <button
                  onClick={() => setSettings({ ...settings, provider: 'openrouter' })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    settings.provider === 'openrouter'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div className="font-medium">OpenRouter</div>
                  <div className="text-xs text-stone-500">多模型聚合平台</div>
                </button>
                <button
                  onClick={() => setSettings({ ...settings, provider: 'openai' })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    settings.provider === 'openai'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div className="font-medium">OpenAI 🎨</div>
                  <div className="text-xs text-stone-500">DALL-E 3 图片生成</div>
                </button>
                <button
                  onClick={() => setSettings({ ...settings, provider: 'siliconflow' })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    settings.provider === 'siliconflow'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div className="font-medium">硅基流动 🇨🇳</div>
                  <div className="text-xs text-stone-500">国内, 便宜, Flux 图片</div>
                </button>
              </div>
            </div>

            {/* API Key */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder={settings.provider === 'kimi' ? 'sk-...' : 'sk-or-...'}
                className="input"
              />
              <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-xs">
                <p className="font-medium mb-1">💡 如何获取 API Key</p>
                {settings.provider === 'kimi' ? (
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-400">
                    <li>访问 platform.moonshot.ai</li>
                    <li>登录后进入「API Key 管理」</li>
                    <li>创建 API Key 并复制</li>
                  </ol>
                ) : settings.provider === 'openai' ? (
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-400">
                    <li>访问 platform.openai.com/api-keys</li>
                    <li>登录 OpenAI 账户</li>
                    <li>创建新的 API Key</li>
                    <li>💡 支持 DALL-E 3 图片生成！</li>
                  </ol>
                ) : settings.provider === 'siliconflow' ? (
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-400">
                    <li>访问 cloud.siliconflow.cn</li>
                    <li>注册/登录账户</li>
                    <li>进入「API 密钥」创建 Key</li>
                    <li>💡 新用户有免费额度！图片 ~¥0.01/张</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-400">
                    <li>访问 openrouter.ai/keys</li>
                    <li>注册/登录账户</li>
                    <li>创建新的 API Key</li>
                  </ol>
                )}
              </div>
            </div>

            {/* Model */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">模型</label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="input"
              >
                {(settings.provider === 'kimi' ? KIMI_MODELS : 
                settings.provider === 'openai' ? OPENAI_MODELS : 
                settings.provider === 'siliconflow' ? SILICONFLOW_MODELS : OPENROUTER_MODELS).map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Test Button */}
            <button
              onClick={handleTest}
              disabled={testing || !settings.apiKey}
              className="w-full btn btn-secondary mb-4 disabled:opacity-50"
            >
              {testing ? '测试中...' : '🧪 测试 API Key'}
            </button>
            
            {testResult && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                testResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {testResult.valid ? '✅ 测试通过' : '❌ 测试失败'}: {testResult.message}
              </div>
            )}

            {/* Database Configuration */}
            <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span>🗄️</span> 数据库配置
              </h3>
              
              {/* Database Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">数据库类型</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSettings({ 
                      ...settings, 
                      database: { ...settings.database, type: 'sqlite' } 
                    })}
                    className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                      settings.database?.type === 'sqlite' || !settings.database?.type
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <div className="font-medium">SQLite</div>
                    <div className="text-xs text-stone-500">本地数据库</div>
                  </button>
                  <button
                    onClick={() => setSettings({ 
                      ...settings, 
                      database: { ...settings.database, type: 'postgresql' } 
                    })}
                    className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                      settings.database?.type === 'postgresql'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <div className="font-medium">PostgreSQL</div>
                    <div className="text-xs text-stone-500">在线数据库</div>
                  </button>
                </div>
              </div>

              {/* PostgreSQL URL */}
              {settings.database?.type === 'postgresql' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">PostgreSQL 连接 URL</label>
                  <input
                    type="text"
                    value={settings.database?.postgresql_url || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      database: { 
                        ...settings.database, 
                        type: 'postgresql',
                        postgresql_url: e.target.value 
                      } 
                    })}
                    placeholder="postgresql://user:password@host:port/dbname?sslmode=require"
                    className="input text-sm"
                  />
                  <p className="mt-1 text-xs text-stone-500">
                    输入 Neon 或其他 PostgreSQL 服务的连接字符串
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={loading} className="flex-1 btn btn-primary">
                {loading ? '保存中...' : (saved ? '✓ 已保存' : '保存设置')}
              </button>
              <button onClick={handleClear} className="btn btn-secondary">
                重置
              </button>
            </div>
          </div>

          {/* Instructions }}
          <div className="card bg-amber-50/50 dark:bg-amber-900/10">
            <h3 className="font-semibold mb-3">💡 使用说明</h3>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <li>• 在「识字」页面选择一个汉字</li>
              <li>• 点击「AI 生成内容」自动生成部首、笔画、儿歌等</li>
              <li>• 点击「生成图片」自动生成插图</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="text-xs text-red-500">Debug: activeTab={activeTab}, users={JSON.stringify(users)?.slice(0,100)}</div>
          {/* Current User */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">当前用户</h3>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-xl text-white font-bold">
                  {(currentUser.display_name || currentUser.username)[0]}
                </div>
                <div>
                  <div className="font-medium text-lg">{currentUser.display_name || currentUser.username}</div>
                  <div className="text-sm text-stone-500">@{currentUser.username}</div>
                </div>
              </div>
            ) : (
              <p className="text-stone-500">未选择用户</p>
            )}
          </div>

          {/* User List */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">用户列表</h3>
              <button 
                onClick={() => setShowAddUser(true)}
                className="btn btn-primary text-sm"
              >
                + 添加用户
              </button>
            </div>

            {showAddUser && (
              <div className="mb-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="用户名（必填，唯一标识）"
                    className="input"
                  />
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="显示名称（可选）"
                    className="input"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCreateUser}
                      disabled={userLoading || !newUsername.trim()}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      {userLoading ? '创建中...' : '创建'}
                    </button>
                    <button 
                      onClick={() => { setShowAddUser(false); setNewUsername(''); setNewDisplayName(''); }}
                      className="btn btn-secondary"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-stone-400 mb-2">Debug: users type = {typeof users}, length = {users?.length}</div>
            {users.length === 0 ? (
              <p className="text-stone-500 text-center py-4">暂无用户</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div 
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      currentUser?.id === user.id 
                        ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200' 
                        : 'bg-stone-50 dark:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-lg font-bold">
                        {(user.display_name || user.username)[0]}
                      </div>
                      <div>
                        <div className="font-medium">{user.display_name || user.username}</div>
                        <div className="text-xs text-stone-500">@{user.username}</div>
                      </div>
                      {currentUser?.id === user.id && (
                        <span className="text-xs px-2 py-0.5 bg-amber-500 text-white rounded-full">当前</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSwitchUser(user)}
                        disabled={currentUser?.id === user.id}
                        className="text-sm px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 disabled:opacity-50"
                      >
                        切换
                      </button>
                      {user.id !== 1 && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="card bg-stone-50 dark:bg-stone-800">
            <h3 className="font-semibold mb-2">关于用户系统</h3>
            <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-1">
              <li>• 每个用户有独立的学习进度记录</li>
              <li>• 切换用户后会显示该用户的学习数据</li>
              <li>• 删除用户会同时删除其所有学习进度</li>
              <li>• 默认用户（id=1）不能删除</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xl">
                📝
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI 提示词</h2>
                <p className="text-sm text-stone-500">查看系统使用的 AI 提示词模板</p>
              </div>
            </div>

            <div className="space-y-4">
              {AI_PROMPTS.map((prompt, idx) => (
                <div key={idx} className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                  <div className="bg-stone-50 dark:bg-stone-800 px-4 py-3 border-b border-stone-200 dark:border-stone-700">
                    <h3 className="font-medium flex items-center gap-2">
                      <span>🤖</span>
                      {prompt.title}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1">{prompt.description}</p>
                  </div>
                  <div className="p-4">
                    <pre className="bg-stone-100 dark:bg-stone-900 p-3 rounded-lg text-xs text-stone-700 dark:text-stone-300 overflow-x-auto whitespace-pre-wrap">
                      {prompt.prompt}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-amber-50/50 dark:bg-amber-900/10">
            <h3 className="font-semibold mb-2">关于提示词</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              这些提示词用于指导 AI 生成学习内容。系统会自动使用这些模板，
              你也可以参考这些模板来理解 AI 是如何生成汉字和词语的学习内容的。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
