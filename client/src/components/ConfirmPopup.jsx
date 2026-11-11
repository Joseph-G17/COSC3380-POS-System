import { useState, useEffect } from "react";

//our own yes/no popup instead of the browser's window.confirm
const ConfirmPopup = ({ message, confirmText = 'Yes', cancelText = 'No', onConfirm, onCancel }) => {
  //Escape = No
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-80 max-w-[90vw] border-2 bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <p className="pb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button className="button-highlight border px-3" onClick={onCancel}>{cancelText}</button>
          <button className="button-highlight border px-3 font-bold" onClick={onConfirm} autoFocus>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

//const [popup, ask] = useConfirm();
//if (!(await ask('Delete this?'))) return;   ...and put {popup} somewhere in the JSX
export const useConfirm = () => {
  const [request, setRequest] = useState(null);

  const ask = (message, options = {}) => new Promise((resolve) => {
    setRequest({ message, ...options, resolve });
  });

  const answer = (yes) => {
    request.resolve(yes);
    setRequest(null);
  };

  const popup = request && (
    <ConfirmPopup
      message={request.message}
      confirmText={request.confirmText}
      cancelText={request.cancelText}
      onConfirm={() => answer(true)}
      onCancel={() => answer(false)}
    />
  );

  return [popup, ask];
}

export default ConfirmPopup
