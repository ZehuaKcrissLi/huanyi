// ComfyUI API基础配置
export const COMFYUI_BASE_URL = 'http://119.29.251.80:8188';

// 服装类型对应的RMBG配置
export const CLOTHES_CONFIGS = {
  upper: {
    Hat: false,
    Hair: false,
    Face: false,
    Sunglasses: false,
    'Upper-clothes': true,
    Skirt: false,
    Dress: false,
    Belt: false,
    Pants: false,
    'Left-arm': true,
    'Right-arm': true,
    'Left-leg': false,
    'Right-leg': false,
    Bag: false,
    Scarf: false,
    'Left-shoe': false,
    'Right-shoe': false,
    Background: false
  },
  lower: {
    Hat: false,
    Hair: false,
    Face: false,
    Sunglasses: false,
    'Upper-clothes': false,
    Skirt: true,
    Dress: false,
    Belt: false,
    Pants: true,
    'Left-arm': false,
    'Right-arm': false,
    'Left-leg': true,
    'Right-leg': true,
    Bag: false,
    Scarf: false,
    'Left-shoe': true,
    'Right-shoe': true,
    Background: false
  },
  dress: {
    Hat: false,
    Hair: false,
    Face: false,
    Sunglasses: false,
    'Upper-clothes': true,
    Skirt: true,
    Dress: true,
    Belt: false,
    Pants: false,
    'Left-arm': true,
    'Right-arm': true,
    'Left-leg': true,
    'Right-leg': true,
    Bag: false,
    Scarf: false,
    'Left-shoe': true,
    'Right-shoe': true,
    Background: false
  }
} as const;

// API响应类型定义
export interface ComfyUIResponse {
  prompt_id: string;
  number: number;
  node_errors: Record<string, string>;
}

export interface HistoryResponse {
  outputs: {
    "14": {  // Save Image node
      images: Array<{
        filename: string;
        type: string;
        subfolder: string;
      }>;
    };
  };
  status: {
    completed: boolean;
    processing: boolean;
    executing: {
      node_id: string;
      prompt_id: string;
      current_step?: number;
      total_steps?: number;
    };
    error?: string;
  };
}

// 完整工作流配置
export const WORKFLOW_API = {
  "1": {
    "inputs": {
      "image": "",
      "upload": "image"
    },
    "class_type": "LoadImage"
  },
  "3": {
    "inputs": {
      "width": 1024,
      "height": 1024,
      "interpolation": "nearest",
      "method": "keep proportion",
      "condition": "always",
      "multiple_of": 0,
      "image": ["6", 0]
    },
    "class_type": "ImageResize+"
  },
  "6": {
    "inputs": {
      "image": "",
      "upload": "image"
    },
    "class_type": "LoadImage"
  },
  "7": {
    "inputs": {
      "seed": 797965172978161,
      "steps": 20,
      "cfg": 3,
      "sampler_name": "euler",
      "scheduler": "beta",
      "denoise": 0.9,
      "model": ["20", 0],
      "positive": ["11", 0],
      "negative": ["10", 1],
      "latent_image": ["10", 2]
    },
    "class_type": "KSampler"
  },
  "8": {
    "inputs": {
      "text": "",
      "clip": ["21", 0]
    },
    "class_type": "CLIPTextEncode"
  },
  "9": {
    "inputs": {
      "samples": ["7", 0],
      "vae": ["42", 0]
    },
    "class_type": "VAEDecode"
  },
  "10": {
    "inputs": {
      "noise_mask": true,
      "positive": ["16", 0],
      "negative": ["8", 0],
      "vae": ["42", 0],
      "pixels": ["34", 0],
      "mask": ["34", 1]
    },
    "class_type": "InpaintModelConditioning"
  },
  "11": {
    "inputs": {
      "guidance": 30,
      "conditioning": ["22", 0]
    },
    "class_type": "FluxGuidance"
  },
  "14": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": ["9", 0]
    },
    "class_type": "SaveImage"
  },
  "16": {
    "inputs": {
      "text": "",
      "clip": ["21", 0]
    },
    "class_type": "CLIPTextEncode"
  },
  "17": {
    "inputs": {
      "clip_name": "sigclip_vision_patch14_384.safetensors"
    },
    "class_type": "CLIPVisionLoader"
  },
  "18": {
    "inputs": {
      "style_model_name": "flux1-redux-dev.safetensors"
    },
    "class_type": "StyleModelLoader"
  },
  "20": {
    "inputs": {
      "unet_name": "flux1-fill-dev.safetensors",
      "weight_dtype": "fp8_e4m3fn"
    },
    "class_type": "UNETLoader"
  },
  "21": {
    "inputs": {
      "clip_name1": "clip_l.safetensors",
      "clip_name2": "t5xxl_fp8_e4m3fn.safetensors",
      "type": "flux"
    },
    "class_type": "DualCLIPLoader"
  },
  "22": {
    "inputs": {
      "strength": 1,
      "strength_type": "multiply",
      "conditioning": ["10", 0],
      "style_model": ["18", 0],
      "clip_vision_output": ["25", 0]
    },
    "class_type": "StyleModelApply"
  },
  "25": {
    "inputs": {
      "crop": "center",
      "clip_vision": ["17", 0],
      "image": ["3", 0]
    },
    "class_type": "CLIPVisionEncode"
  },
  "34": {
    "inputs": {
      "patch_mode": "patch_right",
      "output_length": 1536,
      "patch_color": "#FF0000",
      "first_image": ["3", 0],
      "second_image": ["1", 0],
      "second_mask": ["44", 1]
    },
    "class_type": "AddMaskForICLora"
  },
  "42": {
    "inputs": {
      "vae_name": "diffusion_pytorch_model.safetensors"
    },
    "class_type": "VAELoader"
  },
  "44": {
    "inputs": {
      "process_res": 512,
      "mask_blur": 0,
      "mask_offset": -10,
      "background_color": "Alpha",
      "invert_output": true,
      "images": ["1", 0]
    },
    "class_type": "ClothesSegment"
  }
} as const;

// 重试配置
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1秒 