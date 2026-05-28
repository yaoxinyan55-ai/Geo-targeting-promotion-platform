import { SITE_NAME } from "@/constants";

export function Footer() {
  return (
    <footer className="bg-foreground text-white/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">AI</span>
            <span className="text-lg font-bold text-white">提名官</span>
          </div>

          <p className="text-sm">
            {SITE_NAME} - 让AI搜索主动推荐你的品牌
          </p>

          <p className="text-xs">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
