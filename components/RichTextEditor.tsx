import React from 'react';

// --- Rich Text Editor for Blog ---
const RichTextEditor: React.FC<{ value: string, onChange: (value: string) => void }> = ({ value, onChange }) => {
    const editorRef = React.useRef<HTMLDivElement>(null);

    const applyFormat = (command: string, valueArg?: string) => {
        document.execCommand(command, false, valueArg);
        editorRef.current?.focus();
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };
    
    const toolbarButtons = [
        { command: 'bold', icon: 'B' },
        { command: 'italic', icon: 'I' },
        { command: 'insertUnorderedList', icon: '•' },
        { command: 'insertOrderedList', icon: '1.' },
        { command: 'formatBlock', value: '<h2>', icon: 'H2' },
        { command: 'formatBlock', value: '<h3>', icon: 'H3' },
    ];

    return (
        <div className="border border-slate-300 rounded-lg bg-white">
            <div className="flex items-center gap-1 p-2 border-b bg-slate-50 rounded-t-lg">
                {toolbarButtons.map(({ command, value, icon }) => (
                    <button key={command + (value||'')} type="button" onClick={() => applyFormat(command, value)} className="w-8 h-8 font-bold text-slate-600 hover:bg-slate-200 rounded">{icon}</button>
                ))}
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                className="w-full min-h-[200px] p-3 focus:outline-none text-slate-800"
            ></div>
        </div>
    );
};

export default RichTextEditor;