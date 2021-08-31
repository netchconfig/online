import path = require("path");
import yaml = require("js-yaml");
import fs = require("fs")

const glob = require("glob")


async function getAllYamlFromPath(path: string): Promise<string[]> {
    // return glob("/**/*.ya?ml")
    path = asDirectory(path)
    return new Promise<Array<string>>((resolve, reject) => {
            const s = path + "/**/*.yml";
            glob(s, (error: any, result: any) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        }
    )
}

interface NetchServer {
    server: string
    server_port: number
    method: string
    password: string
    remarks: string
    plugin?: any
    plugin_opts?: any
}

function mapYamlToJsonBase64(src: string, dest: string) {
    const input = fs.readFileSync(src, "utf8")
    let proxies: object[] = (yaml.load(input) as any).proxies
    let netchServers: NetchServer[] = proxies.map<NetchServer>((value: any) => {
        return {
            remarks: value.name,
            server: value.server,
            server_port: value.port,
            method: value.cipher,
            password: value.password
        }
    })
    // string2Base64
    const out = Buffer.from(
        // json2Strin
        JSON.stringify(netchServers)
    ).toString("base64")
    //write to file
    fs.writeFileSync(dest, out)
}

function asDirectory(dir: string): string {
    return path.resolve(dir)
}

function replaceExtension(string: string, newExtention: string) {
    return string.substring(0, string.length - path.extname(string).length) + newExtention
}

async function main(src: string, dest: string) {
    const configs: string[] = await getAllYamlFromPath(src)
    console.log("start converting")
    for (const clashConfig of configs) {
        console.log("converting " + clashConfig)

        let destConfig = path.relative(src,clashConfig)
        //replace extension
        destConfig = replaceExtension(destConfig,".txt")
        destConfig = path.resolve(dest, destConfig)
        try {
            fs.mkdirSync(path.dirname(destConfig))
        } catch (e) {
        }
        console.log("into " + destConfig)

        mapYamlToJsonBase64(clashConfig, destConfig)
    }
    console.log("convert done!")
}

let inputArgs = process.argv.slice(2,4)
let src: string = inputArgs[0]
let dest: string = inputArgs[1]
src = asDirectory(src)
dest = asDirectory(dest)
main(src, dest)