import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Send,
  FileText,
  User,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Smile,
  Frown,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Rating } from '@/types';
import { cn } from '@/lib/utils';

const reviewTags = [
  '服务态度好',
  '办理效率高',
  '材料简化',
  '一次告知清楚',
  '网上办理便捷',
  '流程清晰',
  '工作人员专业',
  '等待时间短',
];

const ratingConfig: Record<Rating, { label: string; emoji: typeof Smile; color: string; bgColor: string }> = {
  1: { label: '非常不满意', emoji: Frown, color: 'text-red-500', bgColor: 'bg-red-50' },
  2: { label: '不满意', emoji: ThumbsDown, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  3: { label: '一般', emoji: Meh, color: 'text-amber-500', bgColor: 'bg-amber-50' },
  4: { label: '满意', emoji: ThumbsUp, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  5: { label: '非常满意', emoji: Smile, color: 'text-green-500', bgColor: 'bg-green-50' },
};

export default function CitizenReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, addReview, currentUser } = useAppStore();

  const [rating, setRating] = useState<Rating>(5);
  const [hoverRating, setHoverRating] = useState<Rating | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const application = useMemo(() => {
    return applications.find((a) => a.id === id) || applications.find((a) => a.status === 'completed') || applications[0];
  }, [applications, id]);

  const displayRating = hoverRating || rating;
  const isBadReview = rating <= 2;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setTimeout(() => {
      if (application && currentUser) {
        addReview({
          applicationId: application.id,
          rating,
          tags: selectedTags,
          comment,
          createdAt: new Date().toISOString(),
          isBadReview,
          ticketId: isBadReview ? `ticket-${Date.now()}` : undefined,
        });
      }
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 1000);
  };

  const RatingEmoji = ratingConfig[displayRating].emoji;

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md rounded-3xl bg-white p-12 text-center shadow-gov"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30"
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800">评价提交成功！</h2>
          <p className="mt-3 text-gray-500">
            感谢您的宝贵评价，我们将持续改进服务质量
          </p>
          {isBadReview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">已自动生成整改工单</p>
                  <p className="mt-1 text-sm text-amber-700">
                    相关部门将在3个工作日内联系您核实并整改，请保持手机畅通。
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-white shadow-md shadow-primary-500/30"
          >
            返回
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6">
      <div className="mx-auto max-w-3xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-600 transition-colors hover:text-primary-600"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>返回</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 overflow-hidden rounded-2xl bg-white shadow-gov"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{application?.serviceItemName}</h2>
                <p className="text-sm text-white/80">办件号：{application?.caseNo}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-5 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="h-4 w-4 text-gray-400" />
              <span>{application?.applicantName}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>{application?.createdAt}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>已办结</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white p-8 shadow-gov"
        >
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold text-gray-800">请对本次服务进行评价</h1>
            <p className="mt-1 text-sm text-gray-500">您的评价是我们改进服务的动力</p>
          </div>

          <div className="mb-8">
            <div className="mb-4 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayRating}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={cn(
                    'mx-auto mb-4 inline-flex items-center justify-center rounded-2xl px-6 py-3',
                    ratingConfig[displayRating].bgColor
                  )}
                >
                  <RatingEmoji className={cn('mr-2 h-8 w-8', ratingConfig[displayRating].color)} />
                  <span className={cn('text-lg font-semibold', ratingConfig[displayRating].color)}>
                    {ratingConfig[displayRating].label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star as Rating)}
                  onMouseEnter={() => setHoverRating(star as Rating)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      'h-10 w-10 transition-colors',
                      star <= displayRating
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                        : 'text-gray-200 hover:text-yellow-300'
                    )}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 flex items-center text-base font-semibold text-gray-800">
              <Sparkles className="mr-2 h-4 w-4 text-primary-500" />
              选择评价标签（可多选）
            </h3>
            <div className="flex flex-wrap gap-3">
              {reviewTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {isSelected && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}
                    {tag}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-base font-semibold text-gray-800">详细评价（选填）</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="请分享您的办理体验和建议，帮助我们改进服务..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {comment.length}/500
            </div>
          </div>

          <AnimatePresence>
            {isBadReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-800">差评提示</p>
                      <p className="mt-1 text-sm text-amber-700">
                        您的不满意评价将自动生成整改工单，相关部门会在3个工作日内联系您核实情况并进行整改。请您保持手机畅通，感谢您的监督！
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              'flex w-full items-center justify-center space-x-2 rounded-xl py-4 text-white font-semibold transition-all',
              isSubmitting
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40'
            )}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                <span>提交中...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>提交评价</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
