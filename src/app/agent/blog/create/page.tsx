"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader'; // Add this import

export default function CreateBlogPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreatePost = async (publish: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agent/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          cover_image_url: coverImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newPost = await response.json();

      if (publish) {
        // Call the publish API route
        const publishResponse = await fetch(`/api/agent/blog/${newPost.id}/publish`, {
          method: 'POST',
        });
        if (!publishResponse.ok) {
          const errorData = await publishResponse.json();
          throw new Error(errorData.error || `HTTP error! status: ${publishResponse.status}`);
        }
      }

      router.push('/agent/blog');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Create New Blog Post</h1>
          <Link href="/agent/blog" className="text-indigo-600 hover:text-indigo-500">
            &larr; Back to Blog List
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <ImageUploader
                label="Cover Image"
                onUploadSuccess={setCoverImageUrl}
              />
              {coverImageUrl && (
                <p className="text-sm text-gray-500 mt-2">
                  Current Cover Image URL: <a href={coverImageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{coverImageUrl}</a>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              {/* TODO: Replace this with a rich text editor like React Quill or Tiptap */}
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => handleCreatePost(false)}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleCreatePost(true)}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
