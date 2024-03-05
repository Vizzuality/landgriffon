import type { SVGAttributes } from 'react';

const WoodSVG = (props?: SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      fill="currentColor"
      viewBox="0 0 24 25"
      {...props}
    >
      <path d="M6.992 13.312c.538 0 .993-.86.993-1.879 0-1.02-.455-1.879-.993-1.879-.54 0-.992.86-.992 1.879 0 1.02.451 1.879.992 1.879Zm0 .498c-.54 0-.992.86-.992 1.88s.451 1.878.992 1.878c.538 0 .993-.859.993-1.879s-.455-1.879-.993-1.879Z" />
      <path d="M17.45 15.226h-1.774a.247.247 0 0 1 0-.494h1.738c-.177-.55-.494-.922-.851-.922a.215.215 0 0 1-.087-.02.233.233 0 0 1-.09.02H7.91c.212.272.365.586.447.922h1.647a.247.247 0 1 1 0 .494H8.451c.02.154.028.308.027.463.001.153-.008.307-.027.459h2.973a.25.25 0 0 1 .229.346.247.247 0 0 1-.229.152H8.357c-.083.335-.235.65-.447.922h8.476c.031 0 .062.007.09.02a.213.213 0 0 1 .087-.02c.357 0 .674-.377.85-.922h-3.51a.249.249 0 0 1-.228-.152.249.249 0 0 1 .229-.346h3.545a.22.22 0 0 1 .075.016 3.608 3.608 0 0 0 0-.95.23.23 0 0 1-.075.012Zm-7.446-4.75a.247.247 0 0 1 .247.247.25.25 0 0 1-.247.251H8.451c.02.152.028.306.027.46.001.154-.008.309-.027.462h2.973a.247.247 0 1 1 0 .494H8.357c-.082.336-.235.65-.447.922h8.476c.031 0 .062.007.09.02a.213.213 0 0 1 .087-.02c.357 0 .674-.373.85-.922h-3.51a.247.247 0 1 1 0-.494h3.546c.025.002.05.006.075.012a3.608 3.608 0 0 0 0-.95.232.232 0 0 1-.075.016h-1.773a.25.25 0 0 1-.229-.346.247.247 0 0 1 .23-.152h1.737c-.177-.545-.494-.922-.851-.922a.307.307 0 0 1-.087-.015.334.334 0 0 1-.09.015H7.91c.212.273.364.587.447.922h1.647ZM12.24 9.06l-1.274-1.279h-.597l.514 1.28h1.357Zm2.119-.682c.33-.326.318-.985.27-1.353-.368-.047-1.027-.06-1.353.27-.33.326-.317.985-.27 1.353.368.048 1.027.06 1.353-.27Z" />
    </svg>
  );
};

export default WoodSVG;
