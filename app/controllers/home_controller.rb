class HomeController < ApplicationController

    def index
        # renders app/views/home/index.html.erb
        article = ':'
        while article.include?(':') || article.include?('/')
            a = HTTParty.get 'https://en.wikipedia.org/w/api.php?action=query&generator=random&prop=info&format=json'
            article = a.parsed_response['query']['pages'].flatten.last['title']
        end
        @article = article
        links = get_links article
        @one = links.first
        @two = links[1]
    end

    def start
        article = ':'
        while article.include?(':') || article.include?('/')
            a = HTTParty.get 'https://en.wikipedia.org/w/api.php?action=query&generator=random&prop=info&format=json'
            article = a.parsed_response['query']['pages'].flatten.last['title']
        end
        render json: {link: article}
    end
# TODO, unicode urls kill app
    def both
        links = get_links params[:article]
        if links == :error # or if it empty
            render json: {error: true} if links == :error
        else
            render json: {link: links.first, link2: links[1], error: false}
        end
    end

    def first
        links = get_links params[:article]
        if links == :error
            render json: {error: true} if links == :error
        else
            render json: {link: links.first, error: false}
        end
    end

    def second
        links = get_links params[:article]
        render json: {link: links[1]}
    end

    def last
        links = get_links params[:article]
        render json: {link: links.last}
    end

    def all
        # this only from header of article though
        links = get_links params[:article]
        render json: {links: links}
    end

    def random
        # should probably have this exclude first and second, or whatever other ones i am using to avoid redundancy
        links = get_links params[:article]
        render json: {link: links.sample}
    end

end

def get_links article
    # TODO, better redirect solving
    # scrub links of files and images
    url = 'https://en.wikipedia.org/w/index.php?action=raw&section=0&title=' + article.gsub(' ', '%20')
    page = HTTParty.get url
    article = page.to_s
    return :error if article == ''
    a = page.gsub(/{{.*}}/m, '')
    scan = a.scan(/\[\[.*?\]\]/)
    clean = scan.map {|a| a.gsub(/\|.*/, '').gsub(']]', '')}
    links = clean.map {|a| a[2..-1]}
    return links
end