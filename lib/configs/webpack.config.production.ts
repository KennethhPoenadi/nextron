import webpack from 'webpack'
import { merge } from 'webpack-merge'
import TerserPlugin from 'terser-webpack-plugin'
import { getMainConfig } from './webpack.config.main'
import { getNextronConfig } from './getNextronConfig'
;(async () => {
  const { webpack: userWebpack } = await getNextronConfig()

  let config: webpack.Configuration = merge(await getMainConfig(), {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
      ],
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        DEBUG_PROD: false,
        START_MINIMIZED: false,
      }),
      new webpack.DefinePlugin({
        'process.type': '"browser"',
      }),
    ],
  })

  if (typeof userWebpack === 'function') {
    config = userWebpack(config, 'development')
  }

  const compiler = webpack(config)

  compiler.run((error, stats) => {
    if (error) {
      console.error(error.stack || error)
    }

    if (stats) {
      console.log(stats.toString())
    }
  })
})()
