import { useEffect, useRef } from "react";
import cardSkeleton from "../../../search/images/cardSkeleton.png";

type ImageWithPlaceholderProps = {
  src: any;
  alt: string;
  width: string | number;
  height: string | number;
  className: string;
};

const ImageWithPlaceholder = ({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: ImageWithPlaceholderProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (imgRef.current) {
              imgRef.current.src = src;
              imgRef.current.onload = () => {
                if (imgRef.current) {
                  imgRef.current.style.opacity = "1";
                }
              };
            }
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="image-container1"
      style={{ width: width, height: height }}
    >
      <img
        ref={imgRef}
        src={cardSkeleton}
        alt={alt}
        style={{ width: width, height: height }}
        className={`${className} image-placeholder1`}
        {...props}
      />
    </div>
  );
};

export default ImageWithPlaceholder;