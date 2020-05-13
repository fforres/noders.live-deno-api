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

export const commands = {
  VOTE: "VOTE",
} as const;

export const parseTwitchMessage = (message: string) => {
  const rawMessage = message?.split("PRIVMSG")[1]?.split(":")[1];
  let command = null;
  if (rawMessage[0] === "!") {
    command = commands.VOTE;
  }
  return {
    command,
    mesage: rawMessage,
  };
};
