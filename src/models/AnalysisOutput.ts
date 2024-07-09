// Define the types of nodes for each analysis

type interferenceTypeList = {
  OA: {
    DECLARATION: "declaration";
    OVERRIDE: "override";
  };
  DEFAULT: {
    SOURCE: "source";
    SINK: "sink";
  };
};

type eventTypeList = {
  OA: {
    INTRA: "OAINTRA";
    INTER: "OAINTER";
  };
  DF: {
    INTRA: "DFINTRA";
    INTER: "DFINTER";
  };
  DEFAULT: "CONFLICT";
};

type Flatten<T> = T extends object ? T[keyof T] : T;

type interferenceType = Flatten<Flatten<interferenceTypeList>>;
type eventType = Flatten<Flatten<Flatten<eventTypeList>>>;

export const interferenceTypes: interferenceTypeList = {
  OA: {
    DECLARATION: "declaration",
    OVERRIDE: "override"
  },
  DEFAULT: {
    SOURCE: "source",
    SINK: "sink"
  }
};

export const eventTypes: eventTypeList = {
  OA: {
    INTRA: "OAINTRA",
    INTER: "OAINTER"
  },
  DF: {
    INTRA: "DFINTRA",
    INTER: "DFINTER"
  },
  DEFAULT: "CONFLICT"
};

// Define the types of the analysis output

type lineLocation = {
  file: string;
  class: string;
  method: string;
  line: number;
};

export type interferenceNode = {
  type: interferenceType;
  branch: "L" | "R";
  text: string;
  location: lineLocation;
  stackTrace?: Array<string>;
};

export type dependency = {
  type: eventType;
  label: string;
  body: {
    description: string;
    interference: Array<interferenceNode>;
  };
};

interface IAnalysisOutput {
  uuid: string;
  repository: string;
  owner: string;
  pull_number: number;
  data: {
    [key: string]: any;
  };
  diff: string;
  events: dependency[];
}

export default class AnalysisOutput implements IAnalysisOutput {
  repository: string;
  owner: string;
  pull_number: number;
  uuid: string;
  data: { [key: string]: any };
  diff: string;
  events: dependency[];

  constructor(analysisOutput: IAnalysisOutput) {
    this.uuid = analysisOutput.uuid;
    this.repository = analysisOutput.repository;
    this.owner = analysisOutput.owner;
    this.pull_number = analysisOutput.pull_number;
    this.data = analysisOutput.data;
    this.diff = analysisOutput.diff;
    this.events = analysisOutput.events;
  }

  public getDependencies(): dependency[] {
    return this.events;
  }

  public getDiff(): string {
    return this.diff;
  }
}
