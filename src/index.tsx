import {
  ActionPanel,
  CopyToClipboardAction,
  Detail,
  List,
  OpenInBrowserAction,
  render,
  showToast,
  ToastStyle,
  MenuItem,
} from "@raycast/api";
// @ts-ignore
import caniuse from "caniuse-api"
import React from "react";

type CanIUseResult = Record<"y"|"n"|"a"|"x", number>

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
    return caniuse.find(query)
  } catch (error) {
    console.error(error);
    showToast(ToastStyle.Failure, "test");
    return []
  }
}

function getSupport(property: string): CanIUseSupportResult | undefined {
  try {
    return caniuse.getSupport(property)
  } catch (error) {
    console.error(error);
    showToast(ToastStyle.Failure, error);
  }
}

function supportToString(support?: CanIUseSupportResult): string {
  if (!support) {
    return ""
  }
  return Object.entries(support).map((([browser, table]) => `${browser}: >=${table.y}`)).join(', ')
}

function SelectPropertyAction({property}: { property: Property}) {
  const context = React.useContext(SharedContext)
  return (
    <MenuItem
      id="getSupport"
      title="Check browser support"
      // icon={Icon.Pencil}
      onAction={() => context.setSelectedProperty(property)}
    />
  );
}

function ListItem(props: { property: Property }) {
  const { property } = props;
  const support = supportToString(getSupport(property))
  return (
    <List.Item
      id={property}
      title={property}
      subtitle={support}
      // icon="list-icon.png"
      accessoryTitle={new Date().toLocaleDateString()}
    >
      <ActionPanel>
        <SelectPropertyAction property={property}/>
        <OpenInBrowserAction url={`https://caniuse.com/${property}`} />
      </ActionPanel>
    </List.Item>
  );
}

const SharedContext = React.createContext({
  selectedProperty: null,
  setSelectedProperty: (property: Property) => {}
})

function Extension() {
  const [selectedProperty, setSelectedProperty] = React.useState<string|null>(null)
  const [query, setQuery] = React.useState("")
  const properties = find(query);
  console.log(selectedProperty);
  if (selectedProperty) {
    return <Detail markdown={"test"}/>
  }
  return <SharedContext.Provider value={{selectedProperty, setSelectedProperty}}>
    <List searchBarPlaceholder="Find CSS properties..." onSearchTextChange={(value)=>{
    setQuery(value)
  }}>
    {properties.map((property) => (
      <ListItem key={property} property={property} />
    ))}
  </List>
  </SharedContext.Provider>
}

render(<Extension/>);
