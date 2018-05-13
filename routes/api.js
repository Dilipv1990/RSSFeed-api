let Item = require('../model/item')
let Feed = require('../model/feed')
let express = require('express')
let router = express.Router()
let logger = require('../logger')
let http = require('http')
let properties = require('../env.json')
let R = require('ramda')
let parseString = require("xml2js").parseString
let defaultUrl = "http://feeds.bbci.co.uk/news/rss.xml"

router.route('/feed').get((request, response) => {
	let url = defaultUrl
	if (request.query.feedUrl)
		url = request.query.feedUrl

	http.get(url, (res) => {
		let chunks = []
		res.on("data", function (chunk) {
			chunks.push(chunk)
		});

		res.on("end", function (data) {
			let body = Buffer.concat(chunks)
			switch (res.statusCode) {
				case 200:
				case 250:
				case 202:
					parseString(body.toString(), (err, jsonResult) => {
						logger.log("debug", jsonResult)

						if (err)
							response.send({
								status: "error",
								data: err
							})
						else
							feedResponse(jsonResult, (formattedRes) => {
								response.send({
									status: "success",
									successResult: formattedRes
								})
							})
					})

					break
				default:
					response.send({
						status: "error",
						data: body.toString()
					})
			}
		})
	})
})

feedResponse = (jsonString, fn) => {
	let channels = jsonString.rss.channel
	let feeds = []

	if (channels && channels.length != 0)
		channels.forEach((channel, channelIndex) => {

			let { copyright, title, lastBuildDate } = channel
			let items = []

			if (channel.item && channel.item.length != 0)
				channel.item.forEach((item, index) => {
					let { title, description, link, pubDate } = item
					let thumbnail = getMedia(item)
					items.push(new Item(title ? title[0] : "", description, link ? link[0] : "", pubDate ? pubDate[0] : "", thumbnail, channelIndex + "i" + index))
				})
			feeds.push(new Feed(copyright, title, lastBuildDate, items))
		})

	fn(feeds)
}

getMedia = (item) => {
	if (item["media:thumbnail"])
		return item["media:thumbnail"][0]["$"]
	if (item["media:group"]) {
		if (item["media:group"][0]["media:content"])
			return item["media:group"][0]["media:content"][0]["$"]
	}
	return undefined
}

module.exports = router