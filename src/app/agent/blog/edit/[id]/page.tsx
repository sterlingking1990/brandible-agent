"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader'; // Add this import

type BlogPost = {
  id: string;
  title: string;
  content: string;
  cover_image_url?: string;
  status: string;
};

export default function EditBlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchPost() {
      try {
        const response = await fetch(`/api/agent/blog/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: BlogPost = await response.json();
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        setCoverImageUrl(data.cover_image_url || '');
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleUpdatePost = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/agent/blog/${id}`, {
        method: 'PUT',
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

      router.push('/agent/blog');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/agent/blog/${id}/publish`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      router.push('/agent/blog');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/agent/blog/${id}/unpublish`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      router.push('/agent/blog');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/agent/blog/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      router.push('/agent/blog');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-12 md:p-24 bg-gray-50">
        <p>Loading blog post...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-12 md:p-24 bg-gray-50">
        <p className="text-red-500">Error loading blog post: {error}</p>
        <Link href="/agent/blog" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Back to Blog List
        </Link>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-12 md:p-24 bg-gray-50">
        <p className="text-gray-700">Blog post not found.</p>
        <Link href="/agent/blog" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Back to Blog List
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Edit Blog Post</h1>
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
                initialImageUrl={coverImageUrl} // Pass the existing image URL
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
              onClick={handleUpdatePost}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            {post.status === 'draft' ? (
              <button
                onClick={handlePublish}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish'}
              </button>
            ) : (
              <button
                onClick={handleUnpublish}
                disabled={submitting}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                {submitting ? 'Unpublishing...' : 'Unpublish'}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
