const path = require("path")


module.exports =
{
	mode: "production",
	entry:
	{
		main: path.resolve(__dirname, "example/main.tsx"),
	},
	
	output:
	{
		filename: "[name].js",
		path: path.resolve(__dirname, "build")
	},
	
    resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"],
		fallback: {
			"@hlorenzi/react-dockable": path.resolve(__dirname, "dist"),
		},
	},
	
	module:
	{
		rules:
		[
			{
				test: /\.(js|jsx|ts|tsx)$/,
				exclude: /node_modules/,
				use:
				{
					loader: "babel-loader",
					options: {
						presets: [
							"@babel/preset-typescript",
							"@babel/preset-env",
							"@babel/preset-react",
						]
					}
				}
			}
		]
	}
}