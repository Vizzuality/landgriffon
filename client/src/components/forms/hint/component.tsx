const Hint: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => (
  <div className="mt-2 text-sm text-gray-300" {...props}>
    <p className="first-letter:uppercase">{children}</p>
  </div>
);

export default Hint;
