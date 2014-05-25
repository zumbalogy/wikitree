Wikitree::Application.routes.draw do

  get  '/'       => 'home#index'
  get  '/start'  => 'home#start'

  post '/first'  => 'home#first'
  post '/second' => 'home#second'
  post '/last'   => 'home#last'

  post '/all'    => 'home#all'
  post '/random' => 'home#random'

end
