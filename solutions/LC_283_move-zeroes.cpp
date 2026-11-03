class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int p = 0;
        for (int i = 0; i < (int)nums.size(); i++)
            if (nums[i] != 0) {
                int t = nums[p];
                nums[p] = nums[i];
                nums[i] = t;
                p++;
            }
    }
};
