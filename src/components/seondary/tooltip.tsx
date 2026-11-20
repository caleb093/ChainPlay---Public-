interface Requirement {
  type: string; 
  value: number;
}

const Tooltip: React.FC<{ requirements: Requirement[] }> = ({ requirements }) => {
  return (
    <div className="absolute bottom-full right-0 mb-2 w-max bg-slate-900 text-white text-xs rounded-md px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
      <p className="font-semibold">Requirements</p>
      {requirements?.map((req, i) => (
        <p key={i}>
          {req.type === "games_played" ? "Games Played" : req.type.toUpperCase()}: {req.value}
        </p>
      ))}
    </div>
  );
};

export default Tooltip