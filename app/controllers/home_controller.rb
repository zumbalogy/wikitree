class HomeController < ApplicationController

    def index
        # renders app/views/home/index.html.erb
    end

    def first
        links = get_links params[:article]
        render json: {link: links.first}
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
    url = 'https://en.wikipedia.org/w/index.php?action=raw&section=0&title=' + article
    page = HTTParty.get url
    article = page.to_s
    a = page.gsub(/{{.*}}/m, '')
    scan = a.scan(/\[\[.*?\]\]/)
    clean = scan.map {|a| a.gsub(/\|.*/, '').gsub(']]', '')}
    links = clean.map {|a| a[2..-1]}
    return links
end