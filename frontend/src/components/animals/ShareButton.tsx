"use client";

import { useState } from "react";
import ShareSheet from "./ShareSheet";

interface Props {
  url: string;
  title: string;
  imageUrl?: string;
}

export default function ShareButton({ url, title, imageUrl }: Props) {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowShare(true)}
        className="block w-full text-center text-sm font-bold px-4 py-3 rounded-full bg-[#F5F4F2] text-[#57534E] border border-[#E7E5E4] hover:bg-[#ECEAE8] transition-colors"
      >
        🔗 공유
      </button>
      {showShare && (
        <ShareSheet url={url} title={title} imageUrl={imageUrl} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
