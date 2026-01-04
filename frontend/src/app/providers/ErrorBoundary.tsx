import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
    // Здесь можно отправить ошибку в Sentry или другой логгер
  }

  render() {
    if (this.state.hasError) {
      // Можно вынести этот UI в отдельный компонент PageError в shared/ui
      return (
        <div className="p-8 bg-white text-red-600 h-screen flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-w-2xl">
            {this.state.error?.toString()}
          </pre>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}