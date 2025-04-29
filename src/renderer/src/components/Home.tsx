import DescriptionHolder from "./app-component/DescriptionHolder";
import PromptHistory from "./app-component/PromptHistory";
import SaideBar from "./app-component/SaideBar";
import UrlPrevew from "./app-component/UrlPrevew";

const Home = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Main content area with sidebar + central content */}
      <div className="flex flex-1 flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="border-r border-gray-700 w-1/4 min-w-[250px] max-w-[30%] flex flex-col items-center justify-between text-white text-xl overflow-hidden">
          <div className="w-full overflow-y-auto flex-grow">
            <SaideBar />
          </div>
          <div className="w-full min-h-[200px] max-h-[40%] overflow-hidden">
            <DescriptionHolder />
          </div>
        </div>

        {/* Central column (url preview + description + prompt history) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-row overflow-hidden border min-h-[200px]">
            {/* URL Preview */}
            <UrlPrevew />
          </div>

          {/* Prompt History */}
          <div className="w-full flex flex-col overflow-hidden min-h-[150px] max-h-[35%]">
            <div className="border-t border-gray-700 w-full h-full flex items-center justify-center text-white text-xl overflow-hidden">
              <PromptHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
