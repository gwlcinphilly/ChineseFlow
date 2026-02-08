"""
AI Service for generating character content and images using LLM APIs
"""
import json
import requests
import base64
import urllib.parse
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Any, Tuple
from pydantic import BaseModel
from image_generator import generate_simple_image

class AISettings(BaseModel):
    provider: str  # 'kimi', 'openrouter', 'openai'
    api_key: str
    model: str

class CharacterContent(BaseModel):
    pinyin: str
    alt_pinyin: Optional[str]
    radical: str
    stroke_count: int
    stroke_order: str
    illustration_desc: str
    rhyme_text: str
    ancient_forms: Dict[str, str]
    etymology: str
    word_groups: Dict[str, list]
    famous_quotes: list
    character_structure: Dict[str, Any]
    meaning: str


def generate_character_content(character: str, settings: AISettings) -> Optional[CharacterContent]:
    """Generate character content using AI"""
    
    system_prompt = """你是一个专业的中文汉字教育专家。你的任务是为给定的汉字生成详细的学习内容。
请按照以下JSON格式返回结果（不要包含任何其他文字）：

{
    "pinyin": "拼音（带声调）",
    "alt_pinyin": "备选读音，没有则为空",
    "radical": "部首",
    "stroke_count": 数字,
    "stroke_order": "笔顺描述，使用标准笔画Unicode符号",
    "illustration_desc": "插图描述（20字以内）",
    "rhyme_text": "四句儿歌，帮助记忆",
    "ancient_forms": {
        "bronze": "金文形式（如无则用现代字）",
        "seal": "小篆形式（如无则用现代字）",
        "clerical": "隶书形式（如无则用现代字）"
    },
    "etymology": "详细的字源解释，包括造字原理",
    "word_groups": {
        "tone1": ["词语1", "词语2"],
        "tone2": ["词语3", "词语4"]
    },
    "famous_quotes": [
        {
            "quote": "名句内容",
            "author": "作者",
            "source": "出处"
        }
    ],
    "character_structure": {
        "base_char": "基础字",
        "related": [
            {"char": "相关字1", "pinyin": "拼音", "meaning": "解释"}
        ]
    },
    "meaning": "基本释义"
}

【重要】笔画必须使用标准Unicode笔画符号：
- 横(一): 一
- 竖(丨): 丨
- 撇(丿): ㇒ 或 丿
- 捺(㇏): ㇏
- 点(丶): 丶
- 提(㇀): ㇀
- 横折(㇕): ㇕
- 横撇(㇇): ㇇
- 横钩(㇖): ㇖
- 竖钩(亅): 亅
- 竖提(㇄): ㇄
- 竖弯(㇄): ㇄
- 竖弯钩(乚): 乚
- 斜钩(㇂): ㇂
- 卧钩(㇃): ㇃
- 撇折(㇜): ㇜
- 撇点(㇛): ㇛
- 横折钩(㇆): ㇆
- 横折提(㇊): ㇊
- 横折弯(㇍): ㇍
- 横折折(㇅): ㇅
- 横折折折(㇎): ㇎
- 横斜钩(㇈): ㇈
- 竖折(㇗): ㇗
- 竖折折(㇞): ㇞
- 竖折折折(㇡): ㇡

示例：
- 八: ㇒ ㇏（不是"撇捺"）
- 人: 丿 ㇏
- 大: 一 丿 ㇏
- 天: 一 一 丿 ㇏（不是"横横撇捺"）
- 木: 一 丨 丿 ㇏（不是"横竖撇捺"）
- 水: 亅 ㇇ 丿 ㇏（不是"竖钩横撇撇捺"）

要求：
1. 笔顺必须使用上述Unicode笔画符号，不能用汉字描述
2. 内容要准确、教育性强
3. 儿歌要朗朗上口，四句，每句5-7字
4. 词语要常用，适合中小学生学习
5. 名句要经典，注明作者和出处
6. 字源解释要通俗易懂
"""

    user_prompt = f"请为汉字「{character}」生成完整的学习内容。"
    
    try:
        if settings.provider == 'kimi':
            return _call_kimi(system_prompt, user_prompt, settings)
        elif settings.provider == 'openrouter':
            return _call_openrouter(system_prompt, user_prompt, settings)
        elif settings.provider == 'openai':
            return _call_openai(system_prompt, user_prompt, settings)
        elif settings.provider == 'siliconflow':
            return _call_siliconflow(system_prompt, user_prompt, settings)
        else:
            raise ValueError(f"Unknown provider: {settings.provider}")
    except Exception as e:
        print(f"AI generation error: {e}")
        import traceback
        traceback.print_exc()
        return None


def _call_kimi(system_prompt: str, user_prompt: str, settings: AISettings) -> Optional[CharacterContent]:
    """Call Kimi API - supports both .cn and .ai platforms"""
    # Use .ai endpoint for international keys
    url = "https://api.moonshot.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json"
    }
    
    # Use the model from settings
    model = settings.model
    
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7
    }
    
    print(f"Calling Kimi API with model: {model}")
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=60)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 401:
            raise Exception("API Key 无效或已过期，请检查您的 Kimi API Key")
        elif response.status_code == 429:
            raise Exception("API 调用频率超限，请稍后再试")
        elif response.status_code != 200:
            print(f"Error response: {response.text}")
            raise Exception(f"API 返回错误: {response.status_code}")
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        print(f"Received content length: {len(content)}")
        
        # Parse JSON from response
        return _parse_content(content)
    except Exception as e:
        print(f"Error in _call_kimi: {e}")
        import traceback
        traceback.print_exc()
        return None


def _call_openrouter(system_prompt: str, user_prompt: str, settings: AISettings) -> Optional[CharacterContent]:
    """Call OpenRouter API"""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Chinese Learning App"
    }
    data = {
        "model": settings.model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        return _parse_content(content)
    except Exception as e:
        print(f"Error in _call_openrouter: {e}")
        import traceback
        traceback.print_exc()
        return None


def _call_openai(system_prompt: str, user_prompt: str, settings: AISettings) -> Optional[CharacterContent]:
    """Call OpenAI API (GPT-4o)"""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": settings.model or "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7
    }
    
    try:
        print(f"Calling OpenAI API with model: {settings.model or 'gpt-4o'}")
        response = requests.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        print(f"Received content length: {len(content)}")
        return _parse_content(content)
    except Exception as e:
        print(f"Error in _call_openai: {e}")
        import traceback
        traceback.print_exc()
        return None


def _call_siliconflow(system_prompt: str, user_prompt: str, settings: AISettings) -> Optional[CharacterContent]:
    """Call SiliconFlow API (国内, 便宜)"""
    url = "https://api.siliconflow.cn/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": settings.model or "Qwen/Qwen2.5-7B-Instruct",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2048
    }
    
    try:
        print(f"Calling SiliconFlow API with model: {settings.model or 'Qwen/Qwen2.5-7B-Instruct'}")
        response = requests.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        print(f"Received content length: {len(content)}")
        return _parse_content(content)
    except Exception as e:
        print(f"Error in _call_siliconflow: {e}")
        import traceback
        traceback.print_exc()
        return None


def _parse_content(content: str) -> Optional[CharacterContent]:
    """Parse AI response content into CharacterContent"""
    print(f"Parsing content: {content[:200]}...")
    
    # Try to extract JSON from markdown code block if present
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
        content = content.split("```")[1].split("```")[0]
    
    content = content.strip()
    
    try:
        data = json.loads(content)
        return CharacterContent(**data)
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")
        print(f"Content: {content}")
        return None


def build_image_prompt(character: str, description: str) -> str:
    """Build AI image generation prompt with consistent style
    
    Style based on "bai" character illustration:
    - Simple, flat illustration for children's Chinese character learning
    - Warm cream/beige background with soft rose/pink border
    - Warm color palette (beige, orange, soft yellow, pink)
    - Minimalist cartoon style
    """
    # Shorter prompt for better compatibility with free services
    prompt = f"""Simple flat illustration for Chinese character "{character}": {description}.
Style: Warm cream background, soft rose decorative border, warm colors (beige, orange, soft yellow, pink),
cartoon style, educational children's book, vector art, flat design, no text."""
    return prompt


def generate_free_image(prompt: str, output_path: str) -> Tuple[bool, str]:
    """Generate image using Pollinations.ai (completely free, no API key needed)
    
    Returns:
        Tuple of (success: bool, message: str)
    """
    try:
        # Pollinations.ai is completely free, no API key needed
        # URL encode the prompt
        encoded_prompt = urllib.parse.quote(prompt)
        
        # Use Flux model for better quality
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed=42&enhance=true"
        
        print(f"Calling Pollinations.ai (free)...")
        print(f"Image URL: {image_url[:80]}...")
        
        # Download the image
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(image_url, headers=headers, timeout=120)
        
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            file_size = len(response.content)
            print(f"✅ Free image saved: {output_path} ({file_size} bytes)")
            return True, f"免费图片生成成功！({file_size} bytes)"
        else:
            return False, f"下载图片失败: {response.status_code}"
            
    except Exception as e:
        error_msg = f"免费图片生成出错: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return False, error_msg


def generate_siliconflow_image(prompt: str, api_key: str, output_path: str) -> Tuple[bool, str]:
    """Generate image using SiliconFlow (国内, 便宜, ~¥0.01/张)
    
    Docs: https://docs.siliconflow.cn/api-reference/images/create-image
    
    Returns:
        Tuple of (success: bool, message: str)
    """
    try:
        url = "https://api.siliconflow.cn/v1/images/generations"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "black-forest-labs/FLUX.1-schnell",  # 便宜快速的模型
            "prompt": prompt,
            "image_size": "1024x1024",
            "num_inference_steps": 4,  # 快速生成
        }
        
        print(f"Calling SiliconFlow API (Flux.1-schnell)...")
        response = requests.post(url, headers=headers, json=data, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            
            # SiliconFlow returns base64 encoded image
            if 'images' in result and len(result['images']) > 0:
                image_b64 = result['images'][0]['url']
                
                # Decode and save
                image_data = base64.b64decode(image_b64)
                with open(output_path, 'wb') as f:
                    f.write(image_data)
                file_size = len(image_data)
                print(f"✅ SiliconFlow image saved: {output_path} ({file_size} bytes)")
                return True, f"硅基流动图片生成成功！({file_size} bytes)"
            else:
                return False, "API 返回数据格式错误"
        else:
            error_msg = response.text
            print(f"SiliconFlow API error: {error_msg}")
            return False, f"SiliconFlow API 错误: {error_msg[:200]}"
            
    except Exception as e:
        error_msg = f"SiliconFlow 生成出错: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return False, error_msg


def generate_dalle_image(prompt: str, api_key: str, output_path: str) -> Tuple[bool, str]:
    """Generate image using DALL-E 3 via OpenAI API
    
    Returns:
        Tuple of (success: bool, message: str)
    """
    try:
        url = "https://api.openai.com/v1/images/generations"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "dall-e-3",
            "prompt": prompt,
            "size": "1024x1024",
            "quality": "standard",
            "n": 1
        }
        
        print(f"Calling DALL-E 3 API...")
        response = requests.post(url, headers=headers, json=data, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            image_url = result['data'][0]['url']
            
            # Download the image
            print(f"Downloading image from: {image_url[:50]}...")
            img_response = requests.get(image_url, timeout=60)
            
            if img_response.status_code == 200:
                with open(output_path, 'wb') as f:
                    f.write(img_response.content)
                file_size = len(img_response.content)
                print(f"✅ DALL-E image saved: {output_path} ({file_size} bytes)")
                return True, f"DALL-E 图片生成成功！({file_size} bytes)"
            else:
                return False, f"下载图片失败: {img_response.status_code}"
        else:
            error_msg = response.text
            print(f"DALL-E API error: {error_msg}")
            return False, f"DALL-E API 错误: {error_msg[:200]}"
            
    except Exception as e:
        error_msg = f"DALL-E 生成出错: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return False, error_msg


def generate_character_image(character: str, illustration_desc: str, settings: AISettings, output_dir: str) -> Tuple[bool, str, Optional[str]]:
    """Generate character illustration image
    
    Supports (in priority order):
    1. SiliconFlow (if provider is 'siliconflow') - 国内, 便宜
    2. Pollinations.ai (completely free, no API key) - DEFAULT
    3. DALL-E 3 (if provider is 'openai')
    4. Local fallback (PIL-based simple generator)
    
    Returns:
        Tuple of (success: bool, message: str, image_path: Optional[str])
    """
    try:
        print(f"Generating image for character: {character}")
        print(f"Description: {illustration_desc}")
        
        # Build the full prompt with style
        full_prompt = build_image_prompt(character, illustration_desc)
        print(f"Image prompt:\n{full_prompt}")
        
        # Use timestamp to create unique filename (preserves old images)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{character}_ai_generated_{timestamp}.png"
        output_path = Path(output_dir) / filename
        
        # Option 1: SiliconFlow (国内, 便宜 ~¥0.01/张)
        if settings.provider == 'siliconflow' and settings.api_key:
            print("Using SiliconFlow (Flux.1-schnell)...")
            success, msg = generate_siliconflow_image(full_prompt, settings.api_key, str(output_path))
            if success:
                return True, msg, f"/images/characters/{filename}"
            else:
                print(f"SiliconFlow failed: {msg}")
        
        # Option 2: Pollinations.ai (completely free) - DEFAULT for all providers
        print("Trying Pollinations.ai (free)...")
        success, msg = generate_free_image(full_prompt, str(output_path))
        if success:
            return True, msg, f"/images/characters/{filename}"
        else:
            print(f"Free service failed: {msg}")
        
        # Option 3: Try DALL-E 3 if using OpenAI provider
        if settings.provider == 'openai' and settings.api_key:
            print("Using DALL-E 3 for image generation...")
            success, msg = generate_dalle_image(full_prompt, settings.api_key, str(output_path))
            if success:
                return True, msg, f"/images/characters/{filename}"
            else:
                print(f"DALL-E failed: {msg}")
        
        # Option 4: Fallback to local simple image generator
        print(f"Using local image generator...")
        image_path = generate_simple_image(character, illustration_desc, output_dir, filename)
        
        if image_path:
            file_size = output_path.stat().st_size
            print(f"✅ Local image generated: {image_path} ({file_size} bytes)")
            return True, f"本地图片生成成功！({file_size} bytes)", image_path
        else:
            return False, "图片生成失败", None
        
    except Exception as e:
        error_msg = f"图片生成出错: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return False, error_msg, None


def test_api_key(settings: AISettings) -> tuple[bool, str]:
    """Test if API key is valid by making a simple request"""
    try:
        if settings.provider == 'kimi':
            # Use .ai endpoint for international platform
            url = "https://api.moonshot.ai/v1/models"
            headers = {
                "Authorization": f"Bearer {settings.api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return True, "API Key 有效"
            elif response.status_code == 401:
                return False, "API Key 无效或已过期"
            else:
                return False, f"API 返回错误: {response.status_code}"
                
        elif settings.provider == 'openrouter':
            url = "https://openrouter.ai/api/v1/auth/key"
            headers = {
                "Authorization": f"Bearer {settings.api_key}",
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return True, f"API Key 有效 - 余额: {data.get('data', {}).get('credits', '未知')}"
            elif response.status_code == 401:
                return False, "API Key 无效或已过期"
            else:
                return False, f"API 返回错误: {response.status_code}"
                
        elif settings.provider == 'openai':
            url = "https://api.openai.com/v1/models"
            headers = {
                "Authorization": f"Bearer {settings.api_key}",
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return True, "API Key 有效 - 支持 DALL-E 3 图片生成！"
            elif response.status_code == 401:
                return False, "API Key 无效或已过期"
            else:
                return False, f"API 返回错误: {response.status_code}"
                
        elif settings.provider == 'siliconflow':
            url = "https://api.siliconflow.cn/v1/models"
            headers = {
                "Authorization": f"Bearer {settings.api_key}",
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return True, "API Key 有效 - 支持 Flux 图片生成！"
            elif response.status_code == 401:
                return False, "API Key 无效或已过期"
            else:
                return False, f"API 返回错误: {response.status_code}"
                
        else:
            return False, f"未知的提供商: {settings.provider}"
            
    except requests.exceptions.Timeout:
        return False, "请求超时，请检查网络连接"
    except requests.exceptions.ConnectionError:
        return False, "无法连接到 API 服务器"
    except Exception as e:
        return False, f"测试出错: {str(e)}"


# Test function
if __name__ == "__main__":
    print("AI Service module loaded successfully")


def generate_word_content(word: str, settings: AISettings) -> Optional[Dict]:
    """Generate word content (pinyin, translation, example sentence) using AI"""
    
    system_prompt = """你是一个专业的中文词汇教育专家。你的任务是为给定的中文词语生成详细的学习内容。
请按照以下JSON格式返回结果（不要包含任何其他文字）：

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
3. 英文翻译要准确自然"""

    user_prompt = f"请为词语 \"{word}\" 生成学习内容。"

    try:
        if settings.provider == 'kimi':
            result = _call_kimi_api(system_prompt, user_prompt, settings)
        elif settings.provider == 'openrouter':
            result = _call_openrouter_api(system_prompt, user_prompt, settings)
        else:
            return None
        
        if result:
            # Parse JSON from response
            try:
                # Try to extract JSON if wrapped in markdown
                if '```json' in result:
                    json_str = result.split('```json')[1].split('```')[0].strip()
                elif '```' in result:
                    json_str = result.split('```')[1].split('```')[0].strip()
                else:
                    json_str = result.strip()
                
                data = json.loads(json_str)
                return {
                    'pinyin': data.get('pinyin', ''),
                    'english_translation': data.get('english_translation', ''),
                    'example_sentence': data.get('example_sentence', ''),
                    'example_pinyin': data.get('example_pinyin', ''),
                    'example_translation': data.get('example_translation', '')
                }
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON: {e}")
                print(f"Raw response: {result}")
                return None
        
        return None
    
    except Exception as e:
        print(f"Error generating word content: {e}")
        return None
