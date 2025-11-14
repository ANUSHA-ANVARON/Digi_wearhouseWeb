import React from 'react';

const NavigationTabs = ({ tabs, activeSection, setActiveSection }) => {
  return (
    <div className="border-b border-gray-200 mb-10">
      <nav className="flex space-x-6 md:space-x-8 lg:space-x-12 xl:space-x-16 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`py-4 px-2 border-b-2 font-medium text-sm lg:text-base whitespace-nowrap transition-colors ${
              activeSection === tab.id
                ? 'border-primary-blue text-primary-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default NavigationTabs;