import "../Styles/TodoApp.css";
interface TodoAppProps {
    accountId: string | null;
    privateKey: string | null;
    evmAddress: string | null;
}
declare const TodoApp: ({ accountId, privateKey, evmAddress }: TodoAppProps) => import("react/jsx-runtime").JSX.Element;
export default TodoApp;
