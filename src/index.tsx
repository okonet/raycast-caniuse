import { ActionPanel, Detail, List, MenuItem, OpenInBrowserAction, render, showToast, ToastStyle } from "@raycast/api";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Types are missing
import caniuse from "caniuse-api";
import { markdownTable } from "markdown-table";
import React from "react";

type CanIUseResult = Record<"y" | "n" | "a" | "x", number>

type CanIUseBrowser =
  "and_chr" |
  "and_ff" |
  "and_qq" |
  "and_uc" |
  "android" |
  "baidu" |
  "chrome" |
  "edge" |
  "firefox" |
  "ie" |
  "ie_mob" |
  "ios_saf" |
  "op_mini" |
  "op_mob" |
  "opera" |
  "safari" |
  "samsung"

type CanIUseSupportResult = Record<CanIUseBrowser, CanIUseResult>

type Property = string

function find(query: string): Property[] {
  try {
    return caniuse.find(query);
  } catch (error) {
    console.error(error);
    showToast(ToastStyle.Failure, error);
    return [];
  }
}

function getSupport(property: string): CanIUseSupportResult | undefined {
  try {
    return caniuse.getSupport(property);
  } catch (error) {
    console.error(error);
    showToast(ToastStyle.Failure, error);
  }
}

function supportToMarkdownTable(support?: CanIUseSupportResult): string {
  if (!support) {
    return "";
  }
  // return Object.entries(support).map((([browser, table]) => `${browser}: >=${table.y}`)).join(', ')
  return markdownTable([["Browser", "Version"], ...Object.entries(support).map((([browser, table]) => [browser, String(table.y)]))]);
}

function SelectPropertyAction({ property }: { property: Property }) {
  const context = React.useContext(SharedContext);
  return (
    <MenuItem
      id="getSupport"
      title="Check browser support"
      onAction={() => context.setSelectedProperty(property)}
    />
  );
}

function ListItem(props: { property: Property }) {
  const { property } = props;
  // const support = supportToMarkdownTable(getSupport(property))
  return (
    <List.Item
      id={property}
      title={property}
    >
      <ActionPanel>
        <SelectPropertyAction property={property} />
        <OpenInBrowserAction url={`https://caniuse.com/${property}`} />
      </ActionPanel>
    </List.Item>
  );
}

const SharedContext = React.createContext<{
  selectedProperty: string | null
  setSelectedProperty: React.Dispatch<React.SetStateAction<string | null>>
}>({
  selectedProperty: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedProperty: () => {
  }
});

function Extension() {
  const [selectedProperty, setSelectedProperty] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const properties = find(query);

  /* Emulate router / navigation */
  if (selectedProperty) {
    return <Detail markdown={`# ${selectedProperty}
${supportToMarkdownTable(getSupport(selectedProperty))}
`} />;
  }
  return <SharedContext.Provider value={{ selectedProperty, setSelectedProperty }}>
    <List searchBarPlaceholder="Find CSS properties..." onSearchTextChange={(value) => {
      setQuery(value);
    }}>
      {properties.map((property) => (
        <ListItem key={property} property={property} />
      ))}
    </List>
  </SharedContext.Provider>;
}

render(<Extension />);
