import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { getNextronConfig } from './getNextronConfig'
import { getMainConfig } from './webpack.config.main'

const getConfig = async () => {
  const { webpack: userWebpack } = await getNextronConfig()

  let config: webpack.Configuration = merge(await getMainConfig(), {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development',
      }),
      new webpack.LoaderOptionsPlugin({
        debug: true,
      }),
    ],
  })

  if (typeof userWebpack === 'function') {
    config = userWebpack(config, 'development')
  }

  return config
}

export { getConfig }
