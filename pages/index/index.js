const App = getApp()
var routes = require('routes');

Page({
    data: {
        activeIndex: 0,
        navList: [],
        indicatorDots: !0,
        autoplay: !1,
        current: 0,
        interval: 3000,
        duration: 1000,
        circular: !0,
	    images: [
            '../../assets/images/banner/banner1.jpg',
            '../../assets/images/banner/banner2.jpg',
            '../../assets/images/banner/banner3.jpg',
            '../../assets/images/banner/banner4.jpg',
	    ],
        goods: {},
        cellHeight: '120px', 
        pageItems: [],

        prompt: {
            hidden: !0,
        },
    },
    swiperchange(e) {
        // console.log(e.detail.current)
    },
    onLoad() {
        this.banner = App.HttpResource('/banner/:id', {id: '@id'})
        this.goods = App.HttpResource('/goods/:id', {id: '@id'})
        this.classify = App.HttpResource('/classify/:id', {id: '@id'})
        this.getCell()
	    //this.getBanners()
        //this.getClassify()
    },
    getCell() {
        var that = this
        //调用应用实例的方法获取全局数据  
        var pageItems = []; 
        var row = []; 
        var len = routes.PageItems.length;//重组PageItems 
        len = Math.floor((len + 2) / 3) * 3; 
        for (var i = 0; i < len; i++) { 
            if ((i + 1) % 3 == 0) { 
                row.push(routes.PageItems[i]); 
                pageItems.push(row); 
                row = []; 
                continue; 
            } 
            else { 
                row.push(routes.PageItems[i]); 
            } 
        }
        wx.getSystemInfo({ 
            success: function (res) { 
             var windowWidth = res.windowWidth; 
             that.setData({ 
              cellHeight: (windowWidth / 3) + 'px'
             }) 
            }, 
            complete: function () { 
             that.setData({ 
              pageItems: pageItems 
             }) 
            } 
        })
    },
    initData() {
        const type = this.data.goods.params && this.data.goods.params.type || ''
        const goods = {
            items: [],
            params: {
                page : 1,
                limit: 10,
                type : type,
            },
            paginate: {}
        }

        this.setData({
            goods: goods
        })
    },
    navigateTo(e) {
        console.log(e)
        App.WxService.navigateTo('/pages/goods/detail/index', {
            id: e.currentTarget.dataset.id
        })
    },
    search() {
        App.WxService.navigateTo('/pages/search/index')
    },
    getBanners() {
    	// App.HttpService.getBanners({is_show: !0})
        this.banner.queryAsync({is_show: !0})
        .then(res => {
            const data = res.data
        	console.log(data)
        	if (data.meta.code == 0) {
                data.data.items.forEach(n => n.path = App.renderImage(n.images[0].path))
        		this.setData({
                    images: data.data.items
                })
        	}
        })
    },
    getClassify() {
        const activeIndex = this.data.activeIndex

        // App.HttpService.getClassify({
        //     page: 1, 
        //     limit: 4, 
        // })
        this.classify.queryAsync({
            page: 1, 
            limit: 4, 
        })
        .then(res => {
            const data = res.data
            console.log(data)
            if (data.meta.code == 0) {
                this.setData({
                    navList: data.data.items,
                    'goods.params.type': data.data.items[activeIndex]._id
                })
                this.onPullDownRefresh()
            }
        })
    },
    getList() {
        const goods = this.data.goods
        const params = goods.params

        // App.HttpService.getGoods(params)
        this.goods.queryAsync(params)
        .then(res => {
            const data = res.data
            console.log(data)
            if (data.meta.code == 0) {
                data.data.items.forEach(n => n.thumb_url = App.renderImage(n.images[0] && n.images[0].path))
                goods.items = [...goods.items, ...data.data.items]
                goods.paginate = data.data.paginate
                goods.params.page = data.data.paginate.next
                goods.params.limit = data.data.paginate.perPage
                this.setData({
                    goods: goods,
                    'prompt.hidden': goods.items.length,
                })
            }
        })
    },
    onPullDownRefresh() {
        console.info('onPullDownRefresh')
        this.initData()
        this.getList()
    },
    onReachBottom() {
        console.info('onReachBottom')
        if (!this.data.goods.paginate.hasNext) return
        this.getList()
    },
    onTapTag(e) {
        const type = e.currentTarget.dataset.type
        const index = e.currentTarget.dataset.index
        const goods = {
            items: [],
            params: {
                page : 1,
                limit: 10,
                type : type,
            },
            paginate: {}
        }
        this.setData({
            activeIndex: index,
            goods: goods,
        })
        this.getList()
    },
})
