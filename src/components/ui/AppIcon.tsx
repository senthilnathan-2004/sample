import { 
  LuKey, 
  LuFlower2, 
  LuGem, 
  LuSmile, 
  LuScissors, 
  LuShoppingBag, 
  LuSparkles,
  LuTruck,
  LuPalette,
  LuMessageCircle,
  LuHeart
} from "react-icons/lu";

export function AppIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return <LuHeart className={className} />;

  switch (name) {
    case "keychains":
    case "🔑":
      return <LuKey className={className} />;
      
    case "bouquets":
    case "💐":
      return <LuFlower2 className={className} />;
      
    case "bag-charms":
    case "🎀":
      return <LuGem className={className} />;
      
    case "soft-toys":
    case "🧸":
      return <LuSmile className={className} />;
      
    case "accessories":
    case "🧶":
      return <LuScissors className={className} />;
      
    case "all":
    case "🛍️":
      return <LuShoppingBag className={className} />;
      
    case "custom":
    case "✨":
      return <LuSparkles className={className} />;

    case "🚚":
      return <LuTruck className={className} />;
      
    case "🎨":
      return <LuPalette className={className} />;
      
    case "💬":
      return <LuMessageCircle className={className} />;

    default:
      return <LuHeart className={className} />;
  }
}
