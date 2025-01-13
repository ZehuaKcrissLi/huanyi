import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, Loader, Plus, X, Download, Trash2, Maximize2 } from 'lucide-react';

interface ImageUpload {
  id: string;
  file: File | null;
  selected: boolean;
  type: 'model' | 'upper' | 'lower' | 'dress';
}

interface ResultImage {
  id: string;
  status: 'processing' | 'completed';
  fileName: string;
  imageUrl: string;
}

interface PreviewModal {
  isOpen: boolean;
  imageUrl: string;
  fileName: string;
}

interface ClothesSegmentConfig {
  Hat: boolean;
  Hair: boolean;
  Face: boolean;
  Sunglasses: boolean;
  'Upper-clothes': boolean;
  Skirt: boolean;
  Dress: boolean;
  Belt: boolean;
  Pants: boolean;
  'Left-arm': boolean;
  'Right-arm': boolean;
  'Left-leg': boolean;
  'Right-leg': boolean;
  Bag: boolean;
  Scarf: boolean;
  'Left-shoe': boolean;
  'Right-shoe': boolean;
  Background: boolean;
}

const CLOTHES_CONFIGS: Record<'upper' | 'lower' | 'dress', ClothesSegmentConfig> = {
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
};

const COMFYUI_BASE_URL = 'http://127.0.0.1:8188';

const WORKFLOW_API = {
  "1": {
    "inputs": {
      "image": "",
      "upload": "image"
    },
    "class_type": "LoadImage"
  },
  "6": {
    "inputs": {
      "image": "",
      "upload": "image"
    },
    "class_type": "LoadImage"
  }
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

function App() {
  const [modelImages, setModelImages] = useState<ImageUpload[]>([
    { id: '1', file: null, selected: false, type: 'model' }
  ]);
  const [upperImages, setUpperImages] = useState<ImageUpload[]>([
    { id: '1', file: null, selected: false, type: 'upper' }
  ]);
  const [lowerImages, setLowerImages] = useState<ImageUpload[]>([
    { id: '1', file: null, selected: false, type: 'lower' }
  ]);
  const [dressImages, setDressImages] = useState<ImageUpload[]>([
    { id: '1', file: null, selected: false, type: 'dress' }
  ]);
  const [resultImages, setResultImages] = useState<ResultImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<PreviewModal>({ isOpen: false, imageUrl: '', fileName: '' });

  const selectedProductCount = upperImages.length + lowerImages.length;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'upper' | 'lower' | 'dress', id: string) => {
    const file = event.target.files?.[0];
    if (file) {
      switch (type) {
        case 'model':
          setModelImages(prev => prev.map(img => 
            img.id === id ? { ...img, file, selected: false } : img
          ));
          break;
        case 'upper':
          setUpperImages(prev => prev.map(img => 
            img.id === id ? { ...img, file, selected: false } : img
          ));
          break;
        case 'lower':
          setLowerImages(prev => prev.map(img => 
            img.id === id ? { ...img, file, selected: false } : img
          ));
          break;
        case 'dress':
          setDressImages(prev => prev.map(img => 
            img.id === id ? { ...img, file, selected: false } : img
          ));
          break;
      }
      setError(null);
    }
  };

  const addUploadComponent = (type: 'model' | 'upper' | 'lower' | 'dress') => {
    const newId = Date.now().toString();
    switch (type) {
      case 'model':
        setModelImages(prev => [...prev, { id: newId, file: null, selected: false, type }]);
        break;
      case 'upper':
        setUpperImages(prev => [...prev, { id: newId, file: null, selected: false, type }]);
        break;
      case 'lower':
        setLowerImages(prev => [...prev, { id: newId, file: null, selected: false, type }]);
        break;
      case 'dress':
        setDressImages(prev => [...prev, { id: newId, file: null, selected: false, type }]);
        break;
    }
  };

  const removeUploadComponent = (type: 'model' | 'upper' | 'lower' | 'dress', id: string) => {
    switch (type) {
      case 'model':
        setModelImages(prev => prev.filter(img => img.id !== id));
        break;
      case 'upper':
        setUpperImages(prev => prev.filter(img => img.id !== id));
        break;
      case 'lower':
        setLowerImages(prev => prev.filter(img => img.id !== id));
        break;
      case 'dress':
        setDressImages(prev => prev.filter(img => img.id !== id));
        break;
    }
  };

  const handleSelection = (type: 'model' | 'upper' | 'lower' | 'dress', id: string) => {
    switch (type) {
      case 'model':
        setModelImages(prev => prev.map(img => ({
          ...img,
          selected: img.id === id
        })));
        break;
      case 'upper':
        setUpperImages(prev => prev.map(img => ({
          ...img,
          selected: img.id === id
        })));
        setLowerImages(prev => prev.map(img => ({ ...img, selected: false })));
        setDressImages(prev => prev.map(img => ({ ...img, selected: false })));
        break;
      case 'lower':
        setLowerImages(prev => prev.map(img => ({
          ...img,
          selected: img.id === id
        })));
        setUpperImages(prev => prev.map(img => ({ ...img, selected: false })));
        setDressImages(prev => prev.map(img => ({ ...img, selected: false })));
        break;
      case 'dress':
        setDressImages(prev => prev.map(img => ({
          ...img,
          selected: img.id === id
        })));
        setUpperImages(prev => prev.map(img => ({ ...img, selected: false })));
        setLowerImages(prev => prev.map(img => ({ ...img, selected: false })));
        break;
    }
  };

  const handleDownload = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download image');
    }
  };

  const handleDelete = (id: string) => {
    setResultImages(prev => prev.filter(img => img.id !== id));
  };

  const handleBatchProcess = async () => {
    const selectedModel = modelImages.find(img => img.selected)?.file;
    const selectedUpper = upperImages.find(img => img.selected && img.file);
    const selectedLower = lowerImages.find(img => img.selected && img.file);
    const selectedDress = dressImages.find(img => img.selected && img.file);
    
    let clothesType: 'upper' | 'lower' | 'dress';
    let selectedClothes: ImageUpload | undefined;
    
    if (selectedUpper) {
      clothesType = 'upper';
      selectedClothes = selectedUpper;
    } else if (selectedLower) {
      clothesType = 'lower';
      selectedClothes = selectedLower;
    } else if (selectedDress) {
      clothesType = 'dress';
      selectedClothes = selectedDress;
    } else {
      setError('请选择一件服装');
      return;
    }

    if (!selectedModel || !selectedClothes.file) {
      setError('请选择模特图片和服装图片');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const modelFormData = new FormData();
      modelFormData.append('image', selectedModel);
      const modelResponse = await axios.post(`${COMFYUI_BASE_URL}/upload/image`, modelFormData);
      const modelImageName = modelResponse.data.name;

      const clothesFormData = new FormData();
      clothesFormData.append('image', selectedClothes.file);
      const clothesResponse = await axios.post(`${COMFYUI_BASE_URL}/upload/image`, clothesFormData);
      const clothesImageName = clothesResponse.data.name;

      const workflowData = JSON.parse(JSON.stringify(WORKFLOW_API));
      
      workflowData["1"].inputs.image = modelImageName;
      
      workflowData["6"].inputs.image = clothesImageName;
      
      workflowData["44"].inputs = {
        ...workflowData["44"].inputs,
        ...CLOTHES_CONFIGS[clothesType],
        process_res: 512,
        mask_blur: 0,
        mask_offset: -10,
        background_color: "Alpha",
        invert_output: true,
        images: [clothesImageName]
      };

      const promptResponse = await axios.post(`${COMFYUI_BASE_URL}/prompt`, {
        prompt: workflowData,
        client_id: `${Date.now()}`
      });

      const checkStatus = async (promptId: string, retryCount = 0) => {
        try {
          const statusResponse = await axios.get(`${COMFYUI_BASE_URL}/history/${promptId}`);
          if (statusResponse.data.status.completed) {
            const outputs = statusResponse.data.outputs;
            const imageUrl = `${COMFYUI_BASE_URL}/view?filename=${outputs["14"].images[0].filename}`;
            setResultImages(prev => [...prev, {
              id: Date.now().toString(),
              status: 'completed',
              fileName: `Result_${clothesType}_${Date.now()}`,
              imageUrl
            }]);
          } else if (statusResponse.data.status.error) {
            throw new Error(statusResponse.data.status.error);
          } else {
            setTimeout(() => checkStatus(promptId, retryCount), 1000);
          }
        } catch (err) {
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => checkStatus(promptId, retryCount + 1), RETRY_DELAY);
          } else {
            throw err;
          }
        }
      };

      await checkStatus(promptResponse.data.prompt_id);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`处理失败: ${err.message}`);
      } else {
        setError('处理图片时发生未知错误');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const ImageUploadComponent = ({ 
    type, 
    image, 
    onUpload, 
    onRemove 
  }: { 
    type: 'model' | 'upper' | 'lower' | 'dress', 
    image: ImageUpload, 
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void 
  }) => (
    <div className="relative">
      <input
        type="radio"
        checked={image.selected}
        onChange={() => handleSelection(type, image.id)}
        className="absolute top-2 left-2 z-10"
      />
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
      >
        <X className="w-4 h-4" />
      </button>
      <div 
        onClick={() => document.getElementById(`${type}-${image.id}`)?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
      >
        <input
          type="file"
          id={`${type}-${image.id}`}
          onChange={onUpload}
          accept="image/*"
          className="hidden"
        />
        <div className="flex flex-col items-center">
          {image.file ? (
            <img
              src={URL.createObjectURL(image.file)}
              alt={`${type} preview`}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Click to upload {type} image</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const isProcessButtonDisabled = loading || 
    !modelImages.some(img => img.selected) || 
    !(
      upperImages.some(img => img.selected) || 
      lowerImages.some(img => img.selected) ||
      dressImages.some(img => img.selected)
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">AI智能换衣</h1>
          <p className="mt-2 text-gray-600">上传服装正面图，一键生成衣服上身效果~</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          {/* Model Images Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">选择模特</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modelImages.map(image => (
                <ImageUploadComponent
                  key={image.id}
                  type="model"
                  image={image}
                  onUpload={(e) => handleImageUpload(e, 'model', image.id)}
                  onRemove={() => removeUploadComponent('model', image.id)}
                />
              ))}
            </div>
            <button
              onClick={() => addUploadComponent('model')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加模特图片
            </button>
          </div>

          {/* Upper Images Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">选择上装</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upperImages.map(image => (
                <ImageUploadComponent
                  key={image.id}
                  type="upper"
                  image={image}
                  onUpload={(e) => handleImageUpload(e, 'upper', image.id)}
                  onRemove={() => removeUploadComponent('upper', image.id)}
                />
              ))}
            </div>
            <button
              onClick={() => addUploadComponent('upper')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加上装图片
            </button>
          </div>

          {/* Lower Images Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">选择下装</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lowerImages.map(image => (
                <ImageUploadComponent
                  key={image.id}
                  type="lower"
                  image={image}
                  onUpload={(e) => handleImageUpload(e, 'lower', image.id)}
                  onRemove={() => removeUploadComponent('lower', image.id)}
                />
              ))}
            </div>
            <button
              onClick={() => addUploadComponent('lower')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加下装图片
            </button>
          </div>

          {/* Dress Images Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">选择连体衣</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dressImages.map(image => (
                <ImageUploadComponent
                  key={image.id}
                  type="dress"
                  image={image}
                  onUpload={(e) => handleImageUpload(e, 'dress', image.id)}
                  onRemove={() => removeUploadComponent('dress', image.id)}
                />
              ))}
            </div>
            <button
              onClick={() => addUploadComponent('dress')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加连体衣图片
            </button>
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <button
              onClick={handleBatchProcess}
              disabled={isProcessButtonDisabled}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Processing...
                </>
              ) : (
                <>
                  <ImageIcon className="-ml-1 mr-3 h-5 w-5" />
                  {/* Process Selected Images ({selectedProductCount}) */}
                  Process Selected Images

                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-center text-sm mt-2">
              {error}
            </div>
          )}

          {/* Results Table */}
          {resultImages.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Index
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preview
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resultImages.map((result, index) => (
                      <tr key={result.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.status === 'processing' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {result.status === 'processing' ? 'Processing' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.fileName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result.imageUrl ? (
                            <div className="relative group">
                              <img 
                                src={result.imageUrl} 
                                alt={result.fileName}
                                className="h-20 w-20 object-cover rounded-lg cursor-pointer"
                                onClick={() => setPreviewModal({ 
                                  isOpen: true, 
                                  imageUrl: result.imageUrl, 
                                  fileName: result.fileName 
                                })}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                <Maximize2 className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              {result.status === 'processing' ? (
                                <Loader className="animate-spin h-6 w-6 text-gray-400" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownload(result.imageUrl, result.fileName)}
                              disabled={!result.imageUrl || result.status === 'processing'}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(result.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewModal({ isOpen: false, imageUrl: '', fileName: '' })}
        >
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setPreviewModal({ isOpen: false, imageUrl: '', fileName: '' })}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewModal.imageUrl}
              alt={previewModal.fileName}
              className="w-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;