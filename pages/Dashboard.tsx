import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { Post, PostStatus, ContentType } from '../types';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    }
    setLoading(false);
  };

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.QUOTE: return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case ContentType.PROVERB: return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case ContentType.RESEARCH: return 'text-green-400 border-green-400/30 bg-green-400/10';
      case ContentType.QUESTIONING: return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-text">Your Library</h2>
        <Link 
          to="/create" 
          className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Create New
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-textMuted py-20">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-border border-dashed">
          <p className="text-textMuted mb-4">You haven't created any posts yet.</p>
          <Link to="/create" className="text-primary hover:underline">Start your first viral arc</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              to={`/post/${post.id}`}
              className="bg-surface hover:bg-surfaceHighlight border border-border rounded-xl p-5 transition-all group hover:border-primary/50 relative flex flex-col h-full cursor-pointer block text-left"
            >
              {/* Header Content */}
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs px-2 py-1 rounded-full border uppercase tracking-wider font-semibold ${getTypeColor(post.content_type)}`}>
                  {post.content_type}
                </span>
                {post.status === PostStatus.APPROVED ? (
                   <CheckCircle size={16} className="text-green-500" />
                ) : (
                   <Clock size={16} className="text-yellow-500" />
                )}
              </div>
              
              {/* Body Content */}
              <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-text mb-2 line-clamp-2 pr-2">
                    {post.input_text}
                  </h3>
              </div>
              
              {/* Footer Content */}
              <div className="flex justify-between items-end mt-4">
                <p className="text-xs text-textMuted">
                   Updated {new Date(post.updated_at).toLocaleDateString()}
                </p>
                <div className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit Arc →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;