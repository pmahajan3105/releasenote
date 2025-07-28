"use client";

import React, { ReactNode, createContext, useContext, useState, Children, isValidElement } from "react";

interface TabsContextValue {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}
const TabsContext = createContext<TabsContextValue | undefined>(undefined);

// Main Tabs component
type TabsProps = {
  children: ReactNode;
  defaultIndex?: number;
  className?: string;
};

function Tabs({ children, defaultIndex = 0, className = "" }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  // Split TabList and TabPanel
  let tabList: ReactNode = null;
  const tabPanelList: ReactNode[] = [];

  let idx = 0;
  React.Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if ((child.type as any).displayName === "TabsList") {
      tabList = React.cloneElement(child as React.ReactElement<any>, { activeIndex, setActiveIndex });
    } else if ((child.type as any).displayName === "TabPanel") {
      tabPanelList.push(React.cloneElement(child as React.ReactElement<TabPanelProps>, { index: idx++ }));
    }
  });

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className={className}>
        {tabList}
        {tabPanelList.map((panel, i) =>
          i === activeIndex ? panel : null
        )}
      </div>
    </TabsContext.Provider>
  );
}

// Tab list container
type TabsListProps = {
  children: ReactNode;
  className?: string;
  activeIndex?: number;
  setActiveIndex?: (i: number) => void;
};

function TabsList({ children, className = "", activeIndex = 0, setActiveIndex }: TabsListProps) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <div role="tablist" className={`flex border-b border-neutral-border ${className}`}>
      {items.map((child, i) =>
        isValidElement<TabProps>(child)
          ? React.cloneElement<TabProps>(child, {
              index: i,
              active: i === activeIndex,
              setActiveIndex,
            })
          : null
      )}
    </div>
  );
}
TabsList.displayName = "TabsList";

// Individual tab button
type TabProps = {
  children: ReactNode;
  index?: number;
  active?: boolean;
  setActiveIndex?: (i: number) => void;
  className?: string;
  disabled?: boolean;
};
function Tab({ children, index = 0, active = false, setActiveIndex, className = "", disabled = false }: TabProps) {
  return (
    <button
      role="tab"
      type="button"
      aria-selected={active}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && setActiveIndex && setActiveIndex(index)}
      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
        active
          ? "border-brand text-brand"
          : "border-transparent text-neutral-600 hover:text-brand hover:border-brand"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {children}
    </button>
  );
}
Tab.displayName = "Tab";

// Tab panel (to render tab content)
type TabPanelProps = {
  children: ReactNode;
  index?: number;
};
function TabPanel({ children }: TabPanelProps) {
  return <div>{children}</div>;
}
TabPanel.displayName = "TabPanel";

// Export structure
Tabs.List = TabsList;
Tabs.Item = Tab;
Tabs.Panel = TabPanel;

export default Tabs;