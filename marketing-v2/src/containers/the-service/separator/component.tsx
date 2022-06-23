interface SeparatorProps {
  image: string;
}

const Separator: React.FC<SeparatorProps> = ({ image }: SeparatorProps) => {
  return (
    <section
      className="relative z-0 h-[50vh] bg-cover"
      style={{ backgroundImage: `url(${image})` }}
    />
  );
};

export default Separator;
