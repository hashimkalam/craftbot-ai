function Loading({ className }: { className?: string }) {
  return (
    <div className="mx-auto flex items-center justify-center h-full w-full">
      <div
        className={`w-16 h-16 ${className} border-4 border-primary dark:border-white border-t-transparent border-solid rounded-full animate-spin`}
      />
    </div>
  );
}

export default Loading;
