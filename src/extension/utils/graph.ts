const generateGraphData = (fileFrom: string, fileTo: string, lineFrom: number, lineTo: number) => {
  const nodes = [
    {
      key: "0",
      attributes: {
        x: 0,
        y: 0,
        label: `${fileFrom.split("/").pop()}:${lineFrom}`,
        size: 15,
        color: "#FA4F40",
        labelPosition: "top"
      }
    },
    {
      key: "1",
      attributes: {
        x: 1,
        y: 0,
        label: `${fileTo.split("/").pop()}:${lineTo}`,
        size: 15,
        color: "#FA4F40",
        labelPosition: "right"
      }
    }
  ];

  const edges = [
    {
      source: "0",
      target: "1",
      attributes: {
        color: "#000000",
        size: 4,
        type: "arrow"
      }
    }
  ];

  return { nodes, edges };
};

export { generateGraphData };
