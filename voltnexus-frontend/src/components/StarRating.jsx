import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, interactive = true, size = 24 }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => interactive && setHover(star)}
                        onMouseLeave={() => interactive && setHover(0)}
                        onClick={() => interactive && setRating(star)}
                        className={`${interactive ? 'cursor-pointer transform hover:scale-110' : 'cursor-default focus:outline-none'} transition-all duration-200`}
                        disabled={!interactive}
                    >
                        <Star
                            size={size}
                            className={`${star <= (hover || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-600'
                                } transition-colors duration-200`}
                        />
                    </button>
                ))}
            </div>
            {interactive && (hover > 0 || rating > 0) && (
                <div className="h-6">
                    <span className="text-yellow-400 font-bold text-lg animate-in fade-in slide-in-from-bottom-1 duration-200">
                        {hover || rating ? `${hover || rating} / 5` : ''}
                    </span>
                </div>
            )}
        </div>
    );
};

export default StarRating;
