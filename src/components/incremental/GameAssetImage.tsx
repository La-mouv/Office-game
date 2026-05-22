import Image from "next/image";
import { getGameAssetPath, type GameAssetId } from "@/lib/gameAssets";

export function GameAssetImage({
  assetId,
  alt = "",
  className = "",
}: {
  assetId: GameAssetId;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={getGameAssetPath(assetId)}
      alt={alt}
      width={512}
      height={512}
      className={`game-asset ${className}`}
      draggable={false}
      loading="lazy"
    />
  );
}
