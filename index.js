const fs = require('fs')
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys } = require('casper-js-sdk')

const client = new CasperClient("http://136.243.187.84:7777/rpc")
const contract = new Contracts.Contract(client)
const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("./keys/secret_key.pem")

const wasm = new Uint8Array(fs.readFileSync("contract/target/wasm32-unknown-unknown/release/contract.wasm"))

async function install() {
    const args = RuntimeArgs.fromMap({
        "message": CLValueBuilder.string("Hello world!")
    })

    const deploy = contract.install(
        wasm,
        args,
        "20000000000",
        keys.publicKey,
        "casper-test",
        [keys]
    )

    try {
        return (await client.putDeploy(deploy))
    } catch(error) {
        return error
    }
}

install().then(deployHash => console.log(deployHash)).catch(error => console.error(error))

async function update_msg() {
    contract.setContractHash("hash-f8e1006c69d4060d2aec149a082f57224d9b48f363280cf176c9d1a2bf2f36a9")
    const args = RuntimeArgs.fromMap({
        "message": CLValueBuilder.string("Hello again!")
    })

    const deploy = contract.callEntrypoint(
        "update_msg",
        args,
        keys.publicKey,
        "casper-test",
        "1000000000",
        [keys]
    )

    try {
        return (await client.putDeploy(deploy))
    } catch(error) {
        return error
    }
}

update_msg().then(deployHash => console.log(deployHash)).catch(error => console.error(error))

function queryMessage() {
    contract.setContractHash("hash-f8e1006c69d4060d2aec149a082f57224d9b48f363280cf176c9d1a2bf2f36a9")
    return contract.queryContractData(["message"])
}

queryMessage().then(result => console.log(result)).catch(error => console.error(error))



