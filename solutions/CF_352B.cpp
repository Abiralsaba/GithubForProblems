#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if(!(cin>>n)) return 0;
    int a[5005];
    for(int i=0;i<n;i++) cin>>a[i];
    vector<int> ans;
    for(int k=1;k<=n;k++){
        bool ok=true;
        for(int st=0;st<n;st+=k){
            int len=min(k,n-st);
            unordered_map<int,int> cur,ref;
            for(int i=st;i<st+len;i++) cur[a[i]]++;
            for(int i=0;i<len;i++) ref[a[i]]++;
            if(cur.size()!=ref.size()){ok=false;break;}
            for(auto &p:cur){
                if(ref[p.first]!=p.second){ok=false;break;}
            }
            if(!ok) break;
        }
        if(ok) ans.push_back(k);
    }
    cout<<ans.size()<<"\n";
    for(int i=0;i<(int)ans.size();i++){
        if(i) cout<<" ";
        cout<<ans[i];
    }
    cout<<"\n";
    return 0;
}
