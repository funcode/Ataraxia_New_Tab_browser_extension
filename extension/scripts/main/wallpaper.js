
// set wallpaper to default
function showDefaultWallpaper() {
	// set wallpaper
	var body = document.getElementById('main-body');
	body.style.backgroundImage = "url('./images/john-reign-abarintos-369080-unsplash.jpg')";
	// set download link
	setDownloadLink();
}

// set footer text
function setFooterText(text) {
	/* 	var footer_text = document.getElementById('footer-text');
		footer_text.innerHTML = text; */
	//fun
	var headline_text = document.getElementById('headline');
	headline_text.innerHTML = text;
	// display / hide the uhd badge
	var uhd_badge = document.getElementById('uhd-badge');
	if (readConf('enable_uhd_wallpaper') == 'yes') {
		uhd_badge.innerHTML = i18n('btr_download_wallpaper_uhd_badge');
	}
	else {
		uhd_badge.innerHTML = '';
	}
}

// display loading animation
function showLoadingAnim() {
	var circle = document.getElementById('loading-circle');
	circle.style.display = 'inline-block';
	// set footer text
	setFooterText('Updating wallpaper ...');
}

// hide loading animation
function hideLoadingAnim() {
	var circle = document.getElementById('loading-circle');
	circle.style.display = 'none';
}

// pre-load image from url
// then change background image and footer text after loading is finished
function loadAndChangeOnlineWallpaper(url, text, headline) {
	//showDefaultWallpaper();
	hideLoadingAnim();
	setFooterText('Updating wallpaper ...');
	// preload wallpaper
	var tmp_img = new Image();
	tmp_img.src = url;
	tmp_img.onload = function () {
		// set wallpaper
		var body = document.getElementById('main-body');
		body.style.backgroundImage = "url('" + url + "')";
		// set footer text
		hideLoadingAnim();
		setFooterText(text);
		// set headline link
		var headline_link = document.getElementById('headline-link');
		headline_link.href = headline;
		// update conf
		writeConf("wallpaper_date", getDateString());
		writeConf("wallpaper_url", url);
		writeConf("wallpaper_text", text);
		writeConf("headline_link", headline);
		// set download link
		setDownloadLink();
	};
}

// get latest wallpaper url from bing.com 
// then load and change wallpaper
function updateWallpaper(idx) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			var obj = JSON.parse(xhr.responseText);
			var url = 'https://bing.com' + obj.images[0].url;
			// if UHD enabled
			if (readConf('enable_uhd_wallpaper') == 'yes') {
				url = url.replaceAll('1920x1080', 'UHD');
			}

			// Append the filter string to the copyright link
			var headlineLink = obj.images[0].copyrightlink;
			var fullstartdate = obj.images[0].fullstartdate;
			var dateTimeStr = fullstartdate.slice(0, 8) + '_' + fullstartdate.slice(8); 
			if (!headlineLink.includes('?')) {
				headlineLink += `?filters=HpDate:"${dateTimeStr}"`;
			} else {
				headlineLink += `&filters=HpDate:"${dateTimeStr}"`;
			}

			loadAndChangeOnlineWallpaper(url, obj.images[0].title, headlineLink);
		}
		else {
			 //showDefaultWallpaper();
		}
	}
	var current_lang = window.navigator.language;
	xhr.open('get', 'https://www.bing.com/HPImageArchive.aspx?format=js&n=1&mkt=' + current_lang + '&idx=' + idx);
	xhr.send(null);
}

// initialize wallpaper on page load
function initWallpaper() {
	// get cache date
	var cache_date = readConf("wallpaper_date");
	if (cache_date == getDateString()) {
		// if today matches cache date, get cache url and text
		var cache_url = readConf("wallpaper_url");
		var cache_text = readConf("wallpaper_text");
		var cache_link = readConf("headline_link");
		if (cache_url != "" && cache_text != "") {
			loadAndChangeOnlineWallpaper(cache_url, cache_text, cache_link);
		}
		else {
			// cache is broken, update wallpaper
			updateWallpaper(0);
		}
	}
	else {
		// if today does not match cache date, update wallpaper
		updateWallpaper(0);
		// reset old wallpaper days offset conf
		writeConf("offset_idx", "0");
	}
}

// if user want to show old wallpapers.
function switchPrevWallpaper() {
	var MAX_OLD_DAYS = 7;
	// calculate idx
	var cache_idx = readConf("offset_idx");
	if (cache_idx === "") {
		cache_idx = 0;
	}
	cache_idx = parseInt(cache_idx);
	cache_idx = (cache_idx + 1) % MAX_OLD_DAYS;
	writeConf("offset_idx", cache_idx.toString());
	// reload wallpaper
	updateWallpaper(cache_idx);
}

function switchNextWallpaper() {
	var MAX_OLD_DAYS = 7;
	// calculate idx
	var cache_idx = readConf("offset_idx");
	if (cache_idx === "") {
		cache_idx = 0;
	}
	cache_idx = parseInt(cache_idx);
	cache_idx = (cache_idx - 1 + MAX_OLD_DAYS) % MAX_OLD_DAYS;
	writeConf("offset_idx", cache_idx.toString());
	// reload wallpaper
	updateWallpaper(cache_idx);
}

// set wallpaper download link
function setDownloadLink() {
	var downloadLink = document.getElementById('wallpaper-download-link');
	downloadLink.href = document.getElementById('main-body').style.backgroundImage.replace('url("', '').replace('")', '');
	downloadLink.download = 'bing-wallpaper-' + getDateString();
}


// --------------------------------------------------

// init wallpaper
initWallpaper();

// bind switch old wallpaper click event
var previous_wp_btn = document.getElementById('previous-wallpaper');
previous_wp_btn.onclick = switchPrevWallpaper;
var next_wp_btn = document.getElementById('next-wallpaper');
next_wp_btn.onclick = switchNextWallpaper;

var left_nav_btn = document.getElementById('leftNav');
left_nav_btn.onclick = switchPrevWallpaper;
var right_nav_btn = document.getElementById('rightNav');
right_nav_btn.onclick = switchNextWallpaper;
