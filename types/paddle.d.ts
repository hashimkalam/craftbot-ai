// paddle.d.ts
declare global {
    interface Window {
      Paddle: {
        Setup: (config: { vendor: number }) => void;
        Checkout: {
          open: (options: {
            product: string;
            successCallback?: (data: any) => void;
            closeCallback?: () => void;
          }) => void;
        };
      };
    }
  }
  
  // This line is needed to make this file a module
  export {};
  