import React from "react";
import { createRoot } from "react-dom/client";
import DependencyView from "../components/DependencyView";

const rootElement = document.querySelector("#dependencies-content-root");
if (rootElement === null) throw new Error("Root not found");

// get the owner, repository and pull_number from the url
const url = window.location.href;
const urlRegex = /^https:\/\/github.com\/(.*)\/(.*)\/pull\/(\d+).*$/;
const match = url.match(urlRegex);
if (match === null) throw new Error("Invalid url");
const owner = match[1];
const repository = match[2];
const pull_number = Number(match[3]);

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DependencyView owner={owner} repository={repository} pull_number={pull_number} />
  </React.StrictMode>
);
