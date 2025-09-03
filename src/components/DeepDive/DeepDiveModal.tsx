'use client';

import React, { useState } from 'react';
import { UFOEvent, DeepDiveContent } from '@/types/event';
import { CATEGORY_COLORS } from '@/constants/categories';

interface DeepDiveModalProps {
  event: UFOEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeepDiveModal: React.FC<DeepDiveModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('Videos');

  if (!isOpen || !event) return null;

  const deepDiveContent = event.deep_dive_content as DeepDiveContent | undefined;
  const categoryColor = CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]?.base || '#999999';

  // Get available content tabs
  const availableTabs = deepDiveContent ? 
    Object.keys(deepDiveContent).filter(key => 
      deepDiveContent[key as keyof DeepDiveContent]?.length
    ) : [];

  // If no deep dive content, show message
  if (availableTabs.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
        <div className="relative bg-gray-900 p-8 rounded-lg border" style={{ borderColor: categoryColor }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">No Deep Dive Content</h2>
            <p className="text-gray-300">This event doesn't have additional multimedia content available.</p>
          </div>
        </div>
      </div>
    );
  }

  // Set first available tab as active if current tab isn't available
  if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
    setActiveTab(availableTabs[0]);
  }

  const renderVideoContent = (content: any[]) => (
    <div className="videos-content space-y-6">
      {content.map((item, index) => (
        <div key={index} className="video-item bg-black/30 rounded-lg p-4">
          {item.content?.video?.map((video: any, vIndex: number) => (
            <div key={vIndex} className="video-entry mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Video {vIndex + 1}</h4>
                <a 
                  href={video.video_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm transition-colors"
                >
                  Watch Video
                </a>
              </div>
              {video.thumbnail && (
                <img 
                  src={video.thumbnail} 
                  alt={`Video ${vIndex + 1} thumbnail`}
                  className="w-full h-48 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderImageContent = (content: any[]) => (
    <div className="images-content">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {content.map((item, index) => {
          if (item.type === 'slider' && Array.isArray(item.content)) {
            return item.content.map((imageUrl: string, imgIndex: number) => (
              <div key={`${index}-${imgIndex}`} className="image-item">
                <img 
                  src={imageUrl} 
                  alt={`Event image ${imgIndex + 1}`}
                  className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
              </div>
            ));
          }
          return null;
        })}
      </div>
    </div>
  );

  const renderReportContent = (content: any[]) => (
    <div className="reports-content space-y-4">
      {content.map((item, index) => {
        if (item.type === 'report' && item.content) {
          return (
            <div key={index} className="report-item bg-black/30 rounded-lg p-4 flex">
              {item.content.thumbnail && (
                <img 
                  src={item.content.thumbnail} 
                  alt="Report thumbnail"
                  className="w-20 h-20 object-cover rounded mr-4"
                />
              )}
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-2">{item.content.title}</h4>
                <a 
                  href={item.content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm transition-colors inline-block"
                >
                  View Report
                </a>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );

  const renderNewsContent = (content: any[]) => (
    <div className="news-content space-y-4">
      {content.map((item, index) => (
        <div key={index} className="news-item bg-black/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">{item.content?.title || `News Item ${index + 1}`}</h4>
          {item.content?.source && (
            <p className="text-gray-400 text-sm mb-2">Source: {item.content.source}</p>
          )}
          <a 
            href={item.content?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm transition-colors inline-block"
          >
            Read Article
          </a>
        </div>
      ))}
    </div>
  );

  const renderTabContent = (tabName: string) => {
    if (!deepDiveContent || !deepDiveContent[tabName as keyof DeepDiveContent]) {
      return <div className="text-gray-400">No content available for this tab.</div>;
    }

    const content = deepDiveContent[tabName as keyof DeepDiveContent];
    if (!content) return null;

    switch (tabName) {
      case 'Videos':
        return renderVideoContent(content);
      case 'Images':
        return renderImageContent(content);
      case 'Reports':
        return renderReportContent(content);
      case 'News Coverage':
        return renderNewsContent(content);
      default:
        return <div className="text-gray-400">Content type not supported</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div 
        className="relative bg-gray-900 w-full max-w-6xl h-full max-h-[90vh] rounded-lg border-2 overflow-hidden"
        style={{ borderColor: categoryColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: categoryColor }}>
          <div>
            <h2 className="text-2xl font-bold text-white">{event.title.toUpperCase()}</h2>
            <p className="text-gray-300">{event.date} • {event.city}, {event.state}, {event.country}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-3xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: categoryColor + '40' }}>
          {availableTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{ 
                borderColor: activeTab === tab ? categoryColor : 'transparent'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {renderTabContent(activeTab)}
        </div>
      </div>
    </div>
  );
};