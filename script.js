const searchButton = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
const videoList = document.querySelector(".video-list");
const pageSwitcher = document.querySelector(".page-switcher");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const pageNumber = document.querySelector(".page-number");
const googleSearch = document.querySelector(".google-search");
const googleSearchBtn = document.querySelector(".google-search-btn");

const url = "https://customsearch.googleapis.com/customsearch/v1";
const apiKey = "AIzaSyB8Tvf92g3_xXdhtq4WEzf--P1i9ib_1cU";
const cxId = "e38cacb8925c34c0b";

let currentPage = 1;
let totalPages = 0;
const resultsPerPage = 10;

const getData = async () => {
  const params = new URLSearchParams({
    key: apiKey,
    cx: cxId,
    q: searchInput.value,
    start: ((currentPage - 1) * resultsPerPage + 1).toString(),
    num: resultsPerPage.toString(),
    siteSearch: "youtube.com",
    orTerms: "video",
  });

  try {
    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    totalPages = data.searchInformation.totalResults;
    addItems(data.items);
  } catch (error) {
    console.error(error);
  }
};

const addItems = (data) => {
  videoList.innerHTML = "";

  data.sort((a, b) => {
    const item1 = a.pagemap?.videoobject?.[0]?.interactioncount || 0;
    const item2 = b.pagemap?.videoobject?.[0]?.interactioncount || 0;
    return item2 - item1;
  });

  data.forEach((item) => {
    const imgUrl = item.pagemap?.cse_image?.[0]?.src;
    const title = item.title;
    const artist = item.pagemap?.person?.[0]?.name || "Unknown artist";
    const views = getViewsCount(
      item.pagemap?.videoobject?.[0]?.interactioncount
    );
    const link = item.link;
    const duration = formatDuration(item.pagemap?.videoobject?.[0]?.duration);

    if (item.pagemap?.videoobject && imgUrl) {
      const div = document.createElement("div");
      div.classList.add("item");

      div.innerHTML = `
        <div class="img-block">
          <img class="img" src="${imgUrl}" alt="${title}">
          <span class="duration">${duration}</span>
        </div>
        <div class="info">
          <h4 class='info-title'>${title}</h4>
          <p class='info-artist'>${artist}</p>
          <div class='info-footer'>
            <img src="./icons/youtube-icon.svg" alt="youtube icon">
            <span>Youtube.com</span>
            <p class='info-views'>${views} views</p>
          </div> 
        </div>
      `;

      videoList.appendChild(div);

      div.addEventListener("click", (e) => {
        e.preventDefault();
        showPreview(imgUrl, title, artist, views, link);
      });
    }
  });

  pageSwitcher.style.display = "flex";
  pageNumber.textContent = currentPage > 1 ? currentPage.toString() : "";
  pageNumber.style.display = currentPage > 1 ? "block" : "none";

  prevBtn.style.display = currentPage > 1 ? "flex" : "none";
  nextBtn.style.display = currentPage < totalPages ? "flex" : "none";

  googleSearch.style.display = "block";
  googleSearchBtn.innerHTML = `
    <img src="./icons/search-icon.svg" alt="search">
    Search <strong>${searchInput.value}</strong> on Google
  `;
};

const getViewsCount = (num) => {
  if (num === undefined) {
    return "unknown";
  }

  const suffixes = ["", "k", "m", "b"];
  const numLength = num.length;
  const suffixIndex = Math.floor((numLength - 1) / 3);
  const formattedNum = (parseFloat(num) / Math.pow(1000, suffixIndex)).toFixed(
    1
  );

  return formattedNum + suffixes[suffixIndex];
};

const formatDuration = (duration) => {
  if (duration) {
    const newDuration = duration.slice(2, -1).replace("M", ":");
    if (newDuration.length === 3) {
      const array = newDuration.split("");
      array.splice(-1, 0, "0");
      return array.join("");
    }
    return newDuration;
  } else {
    return "...";
  }
};

const showPreview = (imgUrl, title, artist, views, link) => {
  const preview = document.createElement("div");
  preview.classList.add("preview");

  preview.innerHTML = `
     <div class="preview-main">
       <img src="${imgUrl}" alt="${title}">
       <h4 class='preview-title'>${title}</h4>
       <div class='preview-info'>
         <span><img src="./icons/youtube-icon.svg" alt="youtube icon">  Youtube.com</span>
         <img src="./icons/dot.svg" alt="dot">
         <span>${views}</span>
       </div>
     </div>
     <div class="preview-btns">
       <button class="visit-btn">Visit</button>
       <button class="close-btn">Close</button>
     </div>
   `;

  preview.querySelector(".visit-btn").addEventListener("click", () => {
    openVideo(link);
    closePreview();
  });
  preview.querySelector(".close-btn").addEventListener("click", () => {
    closePreview();
  });

  document.body.appendChild(preview);
};

const closePreview = () => {
  const preview = document.querySelector(".preview");
  if (preview) {
    preview.remove();
  }
};

const openVideo = (link) => {
  window.open(link, "_blank");
};

searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  getData();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    getData();
  }
});

nextBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentPage < totalPages) {
    currentPage++;
    getData();
  }
});

prevBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentPage > 1) {
    currentPage--;
    getData();
  }
});

googleSearchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const url = `https://www.google.com/search?q=${searchInput.value}`;
  window.open(url, "_blank");
});
