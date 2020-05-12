export const parseSearch = (queryString: string) => {
  var query: { [key: string]: string } = {};
  var pairs = (queryString[0] === "?"
    ? queryString.substr(1)
    : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[window.decodeURIComponent(pair[0])] = window.decodeURIComponent(
      pair[1] || ""
    );
  }
  return query;
};
